from typing import Dict, List, Tuple

from posthog.client import query_with_columns
from posthog.queries.time_to_see_data.serializers import (
    SessionEventsQuerySerializer,
    SessionEventsResponseSerializer,
    SessionResponseSerializer,
    SessionsQuerySerializer,
    UserLookup,
)

IS_FRUSTRATING_INTERACTION = "time_to_see_data_ms >= 5000"

GET_SESSIONS = f"""
SELECT
    session_id,
    any(user_id) AS user_id,
    any(team_id) AS team_id,
    min(timestamp) AS session_start,
    max(timestamp) AS session_end,
    1000 * dateDiff('second', session_start, session_end) AS duration_ms,
    argMax(team_events_last_month, _timestamp) as team_events_last_month,
    count() AS events_count,
    countIf(is_primary_interaction) AS interactions_count,
    sumIf(time_to_see_data_ms, is_primary_interaction) AS total_interaction_time_to_see_data_ms,
    countIf(is_primary_interaction and {IS_FRUSTRATING_INTERACTION}) AS frustrating_interactions_count
FROM metrics_time_to_see_data
WHERE {{condition}}
GROUP BY session_id
ORDER BY session_end DESC
"""

GET_SESSION_EVENTS = f"""
SELECT *, {IS_FRUSTRATING_INTERACTION} AS is_frustrating
FROM metrics_time_to_see_data
WHERE team_id = %(team_id)s
  AND session_id = %(session_id)s
  AND timestamp >= %(session_start)s
  AND timestamp <= toDateTime(%(session_end)s) + toIntervalHour(2)
"""


def get_sessions(query: SessionsQuerySerializer) -> SessionResponseSerializer:
    sessions = _fetch_sessions(query)
    response_serializer = SessionResponseSerializer(
        data=sessions, many=True, context={"user_lookup": UserLookup(sessions)}
    )
    response_serializer.is_valid(raise_exception=True)
    return response_serializer


def get_session_events(query: SessionEventsQuerySerializer) -> SessionEventsResponseSerializer:
    events = query_with_columns(
        GET_SESSION_EVENTS,
        {
            "team_id": query.validated_data["team_id"],
            "session_id": query.validated_data["session_id"],
            "session_start": query.validated_data["session_start"].strftime("%Y-%m-%d %H:%M:%S"),
            "session_end": query.validated_data["session_end"].strftime("%Y-%m-%d %H:%M:%S"),
        },
    )
    session_query = SessionsQuerySerializer(
        data={"team_id": query.validated_data["team_id"], "session_id": query.validated_data["session_id"]}
    )
    session_query.is_valid(raise_exception=True)
    session = get_sessions(session_query).data[0]

    response_serializer = SessionEventsResponseSerializer(data={"session": session, "events": events})
    response_serializer.is_valid(raise_exception=True)
    return response_serializer


def _fetch_sessions(query: SessionsQuerySerializer) -> List[Dict]:
    condition, params = _sessions_condition(query)
    return query_with_columns(GET_SESSIONS.format(condition=condition), params)


def _sessions_condition(query: SessionsQuerySerializer) -> Tuple[str, Dict]:
    conditions = []

    if "team_id" in query.validated_data:
        conditions.append("metrics_time_to_see_data.team_id = %(team_id)s")

    if "session_id" in query.validated_data:
        conditions.append("metrics_time_to_see_data.session_id = %(session_id)s")

    if len(conditions) > 0:
        return " AND ".join(conditions), query.validated_data
    else:
        return "1 = 1", {}
