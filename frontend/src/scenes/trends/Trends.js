import React from 'react'
import { useActions, useValues } from 'kea'

import { Card, CloseButton, Loading } from 'lib/utils'
import { Dropdown } from 'lib/components/Dropdown'
import { SaveToDashboard } from 'lib/components/SaveToDashboard'
import { PropertyFilters } from 'lib/components/PropertyFilters/PropertyFilters'
import { DateFilter } from 'lib/components/DateFilter'

import { ActionFilter } from './ActionFilter'
import { ActionsPie } from './ActionsPie'
import { BreakdownFilter } from './BreakdownFilter'
import { ActionsTable } from './ActionsTable'
import { ActionsLineGraph } from './ActionsLineGraph'
import { ShownAsFilter } from './ShownAsFilter'
import { PeopleModal } from './PeopleModal'

import { trendsLogic } from './trendsLogic'

const displayMap = {
    ActionsLineGraph: 'Line chart',
    ActionsTable: 'Table',
    ActionsPie: 'Pie',
}

export function Trends() {
    const { actions, filters, properties, isLoading, showingPeople } = useValues(trendsLogic)
    const { setFilters, setData, setDisplay } = useActions(trendsLogic)

    return (
        <div className="actions-graph">
            {showingPeople ? <PeopleModal /> : null}
            <h1>Action trends</h1>
            <Card>
                <div className="card-body">
                    <h4 className="secondary">Actions</h4>
                    <ActionFilter
                        actions={actions}
                        actionFilters={filters.actions}
                        onChange={actions => setFilters({ actions })}
                    />
                    <hr />
                    <h4 className="secondary">Filters</h4>
                    <PropertyFilters
                        properties={properties}
                        propertyFilters={filters.properties}
                        onChange={properties => setFilters({ properties })}
                        style={{ marginBottom: 0 }}
                    />
                    <hr />
                    <h4 className="secondary">Break down by</h4>
                    <div className="select-with-close">
                        <BreakdownFilter
                            properties={properties}
                            breakdown={filters.breakdown}
                            onChange={breakdown => setFilters({ breakdown })}
                        />
                        {filters.breakdown && (
                            <CloseButton onClick={() => setFilters({ breakdown: false })} style={{ marginTop: 1 }} />
                        )}
                    </div>
                    <hr />
                    <h4 className="secondary">Shown as</h4>
                    <ShownAsFilter shown_as={filters.shown_as} onChange={shown_as => setFilters({ shown_as })} />
                </div>
            </Card>
            <Card
                title={
                    <span>
                        Graph
                        <div className="float-right">
                            <Dropdown
                                title={displayMap[filters.display || 'ActionsLineGraph']}
                                buttonClassName="btn btn-sm btn-light"
                                buttonStyle={{ margin: '0 8px' }}
                            >
                                <a
                                    className={'dropdown-item ' + (filters.breakdown && 'disabled')}
                                    href="#"
                                    onClick={() => setDisplay('ActionsLineGraph')}
                                >
                                    Line chart {filters.breakdown && '(Not available with breakdown)'}
                                </a>
                                <a className="dropdown-item" href="#" onClick={() => setDisplay('ActionsTable')}>
                                    Table
                                </a>
                                <a
                                    className={'dropdown-item ' + (filters.breakdown && 'disabled')}
                                    href="#"
                                    onClick={() => setDisplay('ActionsPie')}
                                >
                                    Pie {filters.breakdown && '(Not available with breakdown)'}
                                </a>
                            </Dropdown>
                            <DateFilter
                                onChange={(date_from, date_to) =>
                                    setFilters({
                                        date_from: date_from,
                                        date_to: date_to && date_to,
                                    })
                                }
                                dateFrom={filters.date_from}
                                dateTo={filters.date_to}
                            />
                            <SaveToDashboard filters={filters} type={filters.display || 'ActionsLineGraph'} />
                        </div>
                    </span>
                }
            >
                <div className="card-body card-body-graph">
                    {filters.actions && (
                        <div
                            style={{
                                minHeight: 'calc(70vh - 50px)',
                                position: 'relative',
                            }}
                        >
                            {isLoading && <Loading />}
                            {(!filters.display || filters.display == 'ActionsLineGraph') && <ActionsLineGraph />}
                            {filters.display == 'ActionsTable' && <ActionsTable filters={filters} onData={setData} />}
                            {filters.display == 'ActionsPie' && <ActionsPie filters={filters} onData={setData} />}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
