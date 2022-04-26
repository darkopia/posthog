import {
    AtomGroup,
    BehavioralFilterType,
    FilterGroupTypes,
    FilterTypes,
    GroupOption,
} from 'scenes/cohorts/CohortFilters/types'
import {
    ActorGroupType,
    BaseMathType,
    BehavioralCohortType,
    BehavioralEventType,
    BehavioralLifecycleType,
    DateOperatorType,
    OperatorType,
    PropertyMathType,
    TimeUnitType,
    ValueOptionType,
} from '~/types'

export const FILTER_GROUPS: Record<FilterGroupTypes, GroupOption> = {
    [FilterGroupTypes.EventAggregation]: {
        label: 'Event Aggregation',
        type: FilterGroupTypes.EventAggregation,
        values: {
            [BaseMathType.Total]: {
                label: 'Total',
            },
            [BaseMathType.DailyActive]: {
                label: 'Unique',
            },
            [BaseMathType.WeeklyActive]: {
                label: 'Count of weekly active',
            },
            [BaseMathType.MonthlyActive]: {
                label: 'Count of weekly active',
            },
        },
    },
    [FilterGroupTypes.PropertyAggregation]: {
        label: 'Property Aggregation',
        type: FilterGroupTypes.PropertyAggregation,
        values: {
            [PropertyMathType.Average]: {
                label: 'Average',
            },
            [PropertyMathType.Sum]: {
                label: 'Sum',
            },
            [PropertyMathType.Minimum]: {
                label: 'Minimum',
            },
            [PropertyMathType.Maximum]: {
                label: 'Maximum',
            },
            [PropertyMathType.Median]: {
                label: 'Median',
            },
            [PropertyMathType.P90]: {
                label: '90th percentile',
            },
            [PropertyMathType.P95]: {
                label: '95th percentile',
            },
            [PropertyMathType.P99]: {
                label: '99th percentile',
            },
        },
    },
    [FilterGroupTypes.Actors]: {
        label: 'Actors',
        type: FilterGroupTypes.Actors,
        values: {
            [ActorGroupType.Person]: {
                label: 'Persons',
            },
        },
    },
    [FilterGroupTypes.EventBehavioral]: {
        label: 'Behavioral',
        type: FilterGroupTypes.EventBehavioral,
        values: {
            [BehavioralEventType.PerformEvent]: {
                label: 'Completed event',
            },
            [BehavioralEventType.PerformMultipleEvents]: {
                label: 'Completed an event multiple times',
            },
            [BehavioralEventType.PerformSequenceEvents]: {
                label: 'Completed a sequence of events',
            },
            [BehavioralEventType.NotPerformedEvent]: {
                label: 'Did not complete event',
            },
            [BehavioralEventType.HaveProperty]: {
                label: 'Have the property',
            },
            [BehavioralEventType.NotHaveProperty]: {
                label: 'Do not have the property',
            },
        },
    },
    [FilterGroupTypes.CohortBehavioral]: {
        label: 'Cohorts',
        type: FilterGroupTypes.CohortBehavioral,
        values: {
            [BehavioralCohortType.InCohort]: {
                label: 'In cohort',
            },
            [BehavioralCohortType.NotInCohort]: {
                label: 'Not in cohort',
            },
        },
    },
    [FilterGroupTypes.LifecycleBehavioral]: {
        label: 'Lifecycle',
        type: FilterGroupTypes.LifecycleBehavioral,
        values: {
            [BehavioralLifecycleType.PerformEventFirstTime]: {
                label: 'Completed an event for the first time',
            },
            [BehavioralLifecycleType.PerformEventRegularly]: {
                label: 'Completed an event regularly',
            },
            [BehavioralLifecycleType.StopPerformEvent]: {
                label: 'Stopped doing an event',
            },
            [BehavioralLifecycleType.StartPerformEventAgain]: {
                label: 'Started doing an event again',
            },
        },
    },
    [FilterGroupTypes.TimeUnits]: {
        label: 'Units',
        type: FilterGroupTypes.TimeUnits,
        values: {
            [TimeUnitType.Day]: {
                label: 'days',
            },
            [TimeUnitType.Week]: {
                label: 'weeks',
            },
            [TimeUnitType.Month]: {
                label: 'months',
            },
            [TimeUnitType.Year]: {
                label: 'years',
            },
        },
    },
    [FilterGroupTypes.DateOperators]: {
        label: 'Date Operators',
        type: FilterGroupTypes.DateOperators,
        values: {
            [DateOperatorType.BeforeTheLast]: {
                label: 'before the last',
            },
            [DateOperatorType.Between]: {
                label: 'between',
            },
            [DateOperatorType.NotBetween]: {
                label: 'not between',
            },
            [DateOperatorType.OnTheDate]: {
                label: 'on the date',
            },
            [DateOperatorType.NotOnTheDate]: {
                label: 'not on the date',
            },
            [DateOperatorType.Since]: {
                label: 'since',
            },
            [DateOperatorType.Before]: {
                label: 'before',
            },
            [DateOperatorType.IsSet]: {
                label: 'is set',
            },
        },
    },
    [FilterGroupTypes.Operators]: {
        label: 'Operators',
        type: FilterGroupTypes.Operators,
        values: {
            [OperatorType.Equals]: {
                label: 'equals',
            },
            [OperatorType.NotEquals]: {
                label: 'does not equal',
            },
            [OperatorType.Contains]: {
                label: 'contain',
            },
            [OperatorType.NotContains]: {
                label: 'does not contain',
            },
            [OperatorType.MatchesRegex]: {
                label: 'matches regex',
            },
            [OperatorType.NotMatchesRegex]: {
                label: 'does not match regex',
            },
            [OperatorType.GreaterThan]: {
                label: 'greater than',
            },
            [OperatorType.LessThan]: {
                label: 'less than',
            },
            [OperatorType.Set]: {
                label: 'is set',
            },
            [OperatorType.NotSet]: {
                label: 'is not set',
            },
            [OperatorType.NotBetween]: {
                label: 'not between',
            },
            [OperatorType.Minimum]: {
                label: 'minimum',
            },
            [OperatorType.Maximum]: {
                label: 'maximum',
            },
        },
    },
    [FilterGroupTypes.ValueOptions]: {
        label: 'Value Options',
        type: FilterGroupTypes.ValueOptions,
        values: {
            [ValueOptionType.MostRecent]: {
                label: 'most recent value',
            },
            [ValueOptionType.Previous]: {
                label: 'previous value',
            },
            [ValueOptionType.OnDate]: {
                label: 'value on the date',
            },
        },
    },
}

export const FILTER_GRAMMARS: Record<BehavioralFilterType, AtomGroup> = {
    [BehavioralEventType.PerformEvent]: {
        type: BehavioralEventType.PerformEvent,
        atoms: [
            {
                type: FilterTypes.Events,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralEventType.NotPerformedEvent]: {
        type: BehavioralEventType.NotPerformedEvent,
        atoms: [
            {
                type: FilterTypes.Events,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralEventType.PerformMultipleEvents]: {
        type: BehavioralEventType.PerformMultipleEvents,
        atoms: [
            {
                type: FilterTypes.Events,
            },
            {
                type: FilterTypes.MathOperator,
            },
            {
                type: FilterTypes.NumberTicker,
            },
            {
                type: FilterTypes.Text,
                value: 'times in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralEventType.PerformSequenceEvents]: {
        type: BehavioralEventType.PerformSequenceEvents,
        atoms: [
            {
                type: FilterTypes.Events,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
            {
                type: FilterTypes.Text,
                value: 'followed by',
            },
            {
                type: FilterTypes.Events,
            },
            {
                type: FilterTypes.Text,
                value: 'within',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
            {
                type: FilterTypes.Text,
                value: 'of the initial event',
            },
        ],
    },
    [BehavioralEventType.HaveProperty]: {
        type: BehavioralEventType.HaveProperty,
        atoms: [
            {
                type: FilterTypes.EventProperties,
            },
            {
                type: FilterTypes.Text,
                value: 'with the',
            },
            {
                type: FilterTypes.Value,
            },
            {
                type: FilterTypes.MathOperator,
            },
            {
                type: FilterTypes.EventPropertyValues,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralEventType.NotHaveProperty]: {
        type: BehavioralEventType.NotHaveProperty,
        atoms: [
            {
                type: FilterTypes.EventProperties,
            },
            {
                type: FilterTypes.Text,
                value: 'with the',
            },
            {
                type: FilterTypes.Value,
            },
            {
                type: FilterTypes.MathOperator,
            },
            {
                type: FilterTypes.EventPropertyValues,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralCohortType.InCohort]: {
        type: BehavioralCohortType.InCohort,
        atoms: [
            {
                type: FilterTypes.CohortValues,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralCohortType.NotInCohort]: {
        type: BehavioralCohortType.NotInCohort,
        atoms: [
            {
                type: FilterTypes.CohortValues,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralLifecycleType.PerformEventFirstTime]: {
        type: BehavioralLifecycleType.PerformEventFirstTime,
        atoms: [
            {
                type: FilterTypes.Events,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralLifecycleType.PerformEventRegularly]: {
        type: BehavioralLifecycleType.PerformEventRegularly,
        atoms: [
            {
                type: FilterTypes.Events,
            },
            {
                type: FilterTypes.MathOperator,
            },
            {
                type: FilterTypes.NumberTicker,
            },
            {
                type: FilterTypes.Text,
                value: 'times per',
            },
            {
                type: FilterTypes.TimeUnit,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralLifecycleType.StopPerformEvent]: {
        type: BehavioralLifecycleType.StopPerformEvent,
        atoms: [
            {
                type: FilterTypes.Events,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
            {
                type: FilterTypes.Text,
                value: 'but not in the previous',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
    [BehavioralLifecycleType.StartPerformEventAgain]: {
        type: BehavioralLifecycleType.StartPerformEventAgain,
        atoms: [
            {
                type: FilterTypes.Events,
            },
            {
                type: FilterTypes.Text,
                value: 'in the last',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
            {
                type: FilterTypes.Text,
                value: 'but not in the previous',
            },
            {
                type: FilterTypes.Number,
            },
            {
                type: FilterTypes.TimeUnit,
            },
        ],
    },
}
