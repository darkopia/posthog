import './PlayerMeta.scss'
import { dayjs } from 'lib/dayjs'
import { ProfilePicture } from 'lib/components/ProfilePicture'
import { useActions, useValues } from 'kea'
import { PersonHeader } from 'scenes/persons/PersonHeader'
import { playerMetaLogic } from 'scenes/session-recordings/player/playerMetaLogic'
import { TZLabel } from 'lib/components/TimezoneAware'
import { percentage, truncate } from 'lib/utils'
import { IconWindow } from 'scenes/session-recordings/player/icons'
import { CopyToClipboardInline } from 'lib/components/CopyToClipboard'
import { SessionRecordingPlayerProps } from '~/types'
import clsx from 'clsx'
import { LemonSkeleton } from 'lib/components/LemonSkeleton'
import { LemonButton, Link } from '@posthog/lemon-ui'
import { playerSettingsLogic } from './playerSettingsLogic'
import { IconUnfoldLess, IconUnfoldMore } from 'lib/components/icons'
import { PropertiesTable } from 'lib/components/PropertiesTable'
import { CSSTransition } from 'react-transition-group'
import { Tooltip } from 'lib/components/Tooltip'

export function PlayerMeta({ sessionRecordingId, playerKey }: SessionRecordingPlayerProps): JSX.Element {
    const {
        sessionPerson,
        description,
        resolution,
        currentUrl,
        scale,
        currentWindowIndex,
        recordingStartTime,
        loading,
        isSmallPlayer,
    } = useValues(playerMetaLogic({ sessionRecordingId, playerKey }))

    const { isFullScreen, isMetadataExpanded } = useValues(playerSettingsLogic)
    const { setIsMetadataExpanded } = useActions(playerSettingsLogic)

    return (
        <div
            className={clsx('PlayerMeta', {
                'PlayerMeta--fullscreen': isFullScreen,
            })}
        >
            {isFullScreen && (
                <div className="PlayerMeta__escape">
                    <div className="bg-muted-dark text-white px-2 py-1 rounded shadow my-1 mx-auto">
                        Press <kbd className="font-bold">Esc</kbd> to exit full screen
                    </div>
                </div>
            )}

            <div
                className={clsx('flex items-center gap-2', {
                    'p-3 border-b': !isFullScreen,
                    'px-3 p-1 text-xs': isFullScreen,
                })}
            >
                <div className="mr-2">
                    {!sessionPerson ? (
                        <LemonSkeleton.Circle className="w-12 h-12" />
                    ) : (
                        <ProfilePicture
                            name={sessionPerson?.name}
                            email={sessionPerson?.properties?.$email}
                            size={!isFullScreen ? 'xxl' : 'md'}
                        />
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="font-bold">
                        {!sessionPerson || !recordingStartTime ? (
                            <LemonSkeleton className="w-1/3 my-1" />
                        ) : (
                            <div className="flex gap-1">
                                <PersonHeader person={sessionPerson} withIcon={false} noEllipsis={true} />
                                {'·'}
                                <TZLabel
                                    time={dayjs(recordingStartTime)}
                                    formatDate="MMMM DD, YYYY"
                                    formatTime="h:mm A"
                                    showPopover={false}
                                />
                            </div>
                        )}
                    </div>
                    <div className=" text-muted">
                        {loading ? <LemonSkeleton className="w-1/4 my-1" /> : <span>{description}</span>}
                    </div>
                </div>
                <Tooltip
                    title={isMetadataExpanded ? 'Hide person properties' : 'Show person properties'}
                    placement={isFullScreen ? 'bottom' : 'left'}
                >
                    <LemonButton
                        className={clsx('PlayerMeta__expander', isFullScreen ? 'rotate-90' : '')}
                        status="stealth"
                        active={isMetadataExpanded}
                        onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
                        icon={isMetadataExpanded ? <IconUnfoldLess /> : <IconUnfoldMore />}
                    />
                </Tooltip>
            </div>
            {sessionPerson && (
                <CSSTransition
                    in={isMetadataExpanded}
                    timeout={200}
                    classNames="PlayerMetaPersonProperties-"
                    mountOnEnter
                    unmountOnExit
                >
                    <div className="PlayerMetaPersonProperties">
                        {Object.keys(sessionPerson.properties).length ? (
                            <PropertiesTable properties={sessionPerson.properties} />
                        ) : (
                            <p className="text-center m-4">There are no properties.</p>
                        )}
                    </div>
                </CSSTransition>
            )}
            <div
                className={clsx('flex items-center justify-between gap-2 whitespace-nowrap', {
                    'p-3 flex-wrap': !isFullScreen,
                    'p-1 px-3 text-xs h-12': isFullScreen,
                })}
            >
                {loading || currentWindowIndex === -1 ? (
                    <LemonSkeleton className="w-1/3 my-1" />
                ) : (
                    <>
                        <IconWindow value={currentWindowIndex + 1} className="text-muted" />
                        {!isSmallPlayer && <div className="window-number">Window {currentWindowIndex + 1}</div>}
                        {currentUrl && (
                            <>
                                {'· '}
                                <Link to={currentUrl} target="_blank">
                                    {truncate(currentUrl, 32)}
                                </Link>
                                <span className="flex items-center">
                                    <CopyToClipboardInline description="current url" explicitValue={currentUrl} />
                                </span>
                            </>
                        )}
                    </>
                )}
                <div className="flex-1" />
                {loading ? (
                    <LemonSkeleton className="w-1/3" />
                ) : (
                    <span>
                        {resolution && (
                            <>
                                Resolution: {resolution.width} x {resolution.height}{' '}
                                {!isSmallPlayer && `(${percentage(scale, 1, true)})`}
                            </>
                        )}
                    </span>
                )}
            </div>
        </div>
    )
}
