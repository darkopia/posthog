import { LemonButton, LemonCheckbox, LemonDivider, LemonInput, LemonSelect } from '@posthog/lemon-ui'
import { useActions, useValues } from 'kea'
import { Form } from 'kea-forms'
import { FEATURE_FLAGS } from 'lib/constants'
import { IconInfo } from 'lib/lemon-ui/icons'
import { LemonBanner } from 'lib/lemon-ui/LemonBanner'
import { LemonCalendarSelectInput } from 'lib/lemon-ui/LemonCalendar/LemonCalendarSelect'
import { LemonField } from 'lib/lemon-ui/LemonField'
import { LemonFileInput } from 'lib/lemon-ui/LemonFileInput/LemonFileInput'
import { LemonSelectMultiple } from 'lib/lemon-ui/LemonSelectMultiple/LemonSelectMultiple'
import { LemonSkeleton } from 'lib/lemon-ui/LemonSkeleton'
import { Tooltip } from 'lib/lemon-ui/Tooltip'
import { featureFlagLogic } from 'lib/logic/featureFlagLogic'

import { BatchExportConfigurationForm, batchExportsEditLogic, BatchExportsEditLogicProps } from './batchExportEditLogic'

export function BatchExportsEditForm(props: BatchExportsEditLogicProps): JSX.Element {
    const logic = batchExportsEditLogic(props)
    const { isNew, batchExportConfigForm, isBatchExportConfigFormSubmitting, batchExportConfigLoading } =
        useValues(logic)
    const { submitBatchExportConfigForm, cancelEditing } = useActions(logic)

    return (
        <>
            {batchExportConfigLoading ? (
                <>
                    <LemonSkeleton />
                    <LemonSkeleton />
                    <LemonSkeleton />
                    <LemonSkeleton />
                </>
            ) : (
                <>
                    <Form
                        logic={batchExportsEditLogic}
                        props={props}
                        formKey="batchExportConfigForm"
                        className="space-y-4"
                    >
                        <BatchExportsEditFields isNew={isNew} batchExportConfigForm={batchExportConfigForm} />

                        <div className="flex gap-4">
                            <LemonButton
                                data-attr="cancel-batch-export"
                                type="secondary"
                                onClick={() => cancelEditing()}
                                disabledReason={isBatchExportConfigFormSubmitting ? 'Currently being saved' : undefined}
                            >
                                Cancel
                            </LemonButton>
                            <LemonButton
                                data-attr="save-batch-export"
                                htmlType="submit"
                                type="primary"
                                onClick={submitBatchExportConfigForm}
                                loading={isBatchExportConfigFormSubmitting}
                            >
                                {isNew ? 'Create' : 'Save'}
                            </LemonButton>
                        </div>
                    </Form>
                </>
            )}
        </>
    )
}

export function BatchExportsEditFields({
    isNew,
    isPipeline = false,
    batchExportConfigForm,
}: {
    isNew: boolean
    isPipeline?: boolean
    batchExportConfigForm: BatchExportConfigurationForm
}): JSX.Element {
    const { featureFlags } = useValues(featureFlagLogic)
    const highFrequencyBatchExports = featureFlags[FEATURE_FLAGS.HIGH_FREQUENCY_BATCH_EXPORTS]

    return (
        <>
            <div className="space-y-4 max-w-200">
                {!isPipeline && (
                    <LemonField name="name" label="Name">
                        <LemonInput placeholder="Name your workflow for future reference" />
                    </LemonField>
                )}

                <div className="flex gap-2 items-start flex-wrap">
                    <LemonField
                        name="interval"
                        label="Batch interval"
                        className="flex-1"
                        info={
                            <>
                                The intervals of data exports. For example, if you select hourly, every hour a run will
                                be created to export that hours data.
                            </>
                        }
                    >
                        <LemonSelect
                            options={[
                                { value: 'hour', label: 'Hourly' },
                                { value: 'day', label: 'Daily' },
                                {
                                    value: 'every 5 minutes',
                                    label: 'Every 5 minutes',
                                    hidden: !highFrequencyBatchExports,
                                },
                            ]}
                        />
                    </LemonField>
                    {(!isPipeline || batchExportConfigForm.end_at) && ( // Not present in the new UI unless grandfathered in
                        <LemonField
                            name="end_at"
                            label="End date"
                            className="flex-1"
                            info={
                                <>
                                    The date up to which data is to be exported. Leaving it unset implies that data
                                    exports will continue forever until this export is paused or deleted.
                                </>
                            }
                        >
                            {({ value, onChange }) => (
                                <LemonCalendarSelectInput
                                    value={value}
                                    onChange={onChange}
                                    placeholder="Select end date (optional)"
                                    clearable
                                />
                            )}
                        </LemonField>
                    )}
                </div>

                <LemonBanner type="info">
                    This batch exporter will schedule regular batch exports at your indicated interval until the end
                    date. Once you have configured your exporter, you can trigger a manual export for historic data.
                </LemonBanner>

                {isNew && !isPipeline ? (
                    <LemonField name="paused">
                        <LemonCheckbox
                            bordered
                            label={
                                <span className="flex items-center gap-2">
                                    Create in paused state
                                    <Tooltip
                                        title={
                                            "If selected, the Batch Exporter will be created but will be 'paused' allowing you to resumed it at a later date."
                                        }
                                    >
                                        <IconInfo className=" text-lg text-muted-alt" />
                                    </Tooltip>
                                </span>
                            }
                        />
                    </LemonField>
                ) : null}
            </div>

            <div className="space-y-4 max-w-200 w-full ">
                <LemonDivider />
                <LemonField name="destination" label="Destination">
                    <LemonSelect
                        options={[
                            { value: 'BigQuery', label: 'BigQuery' },
                            { value: 'Postgres', label: 'PostgreSQL' },
                            { value: 'Redshift', label: 'Redshift' },
                            { value: 'S3', label: 'S3' },
                            { value: 'Snowflake', label: 'Snowflake' },
                        ]}
                    />
                </LemonField>

                {!batchExportConfigForm.destination ? (
                    <p className="text-muted-alt italic">Select a destination to continue configuring</p>
                ) : batchExportConfigForm.destination === 'S3' ? (
                    <>
                        <div className="flex gap-4">
                            <LemonField name="bucket_name" label="Bucket" className="flex-1">
                                <LemonInput placeholder="e.g. my-bucket" />
                            </LemonField>
                            <LemonField name="region" label="Region" className="flex-1">
                                <LemonSelect
                                    options={[
                                        { value: 'us-east-1', label: 'US East (N. Virginia)' },
                                        { value: 'us-east-2', label: 'US East (Ohio)' },
                                        { value: 'us-west-1', label: 'US West (N. California)' },
                                        { value: 'us-west-2', label: 'US West (Oregon)' },
                                        { value: 'af-south-1', label: 'Africa (Cape Town)' },
                                        { value: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },
                                        { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
                                        {
                                            value: 'ap-northeast-3',
                                            label: 'Asia Pacific (Osaka-Local)',
                                        },
                                        { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
                                        { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
                                        { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
                                        { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
                                        { value: 'ca-central-1', label: 'Canada (Central)' },
                                        { value: 'cn-north-1', label: 'China (Beijing)' },
                                        { value: 'cn-northwest-1', label: 'China (Ningxia)' },
                                        { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
                                        { value: 'eu-west-1', label: 'Europe (Ireland)' },
                                        { value: 'eu-west-2', label: 'Europe (London)' },
                                        { value: 'eu-south-1', label: 'Europe (Milan)' },
                                        { value: 'eu-west-3', label: 'Europe (Paris)' },
                                        { value: 'eu-north-1', label: 'Europe (Stockholm)' },
                                        { value: 'me-south-1', label: 'Middle East (Bahrain)' },
                                        { value: 'sa-east-1', label: 'South America (São Paulo)' },
                                    ]}
                                />
                            </LemonField>
                        </div>
                        <LemonField name="prefix" label="Key prefix">
                            <LemonInput placeholder="e.g. posthog-events/" />
                        </LemonField>

                        <div className="flex gap-4">
                            <LemonField name="compression" label="Compression" className="flex-1">
                                <LemonSelect
                                    options={[
                                        { value: 'gzip', label: 'gzip' },
                                        { value: 'brotli', label: 'brotli' },
                                        { value: null, label: 'No compression' },
                                    ]}
                                />
                            </LemonField>

                            <LemonField name="encryption" label="Encryption" className="flex-1">
                                <LemonSelect
                                    options={[
                                        { value: 'AES256', label: 'AES256' },
                                        { value: 'aws:kms', label: 'aws:kms' },
                                        { value: null, label: 'No encryption' },
                                    ]}
                                />
                            </LemonField>
                        </div>

                        <div className="flex gap-4">
                            <LemonField name="aws_access_key_id" label="AWS Access Key ID" className="flex-1">
                                <LemonInput placeholder={isNew ? 'e.g. AKIAIOSFODNN7EXAMPLE' : 'Leave unchanged'} />
                            </LemonField>

                            <LemonField name="aws_secret_access_key" label="AWS Secret Access Key" className="flex-1">
                                <LemonInput
                                    placeholder={isNew ? 'e.g. secret-key' : 'Leave unchanged'}
                                    type="password"
                                />
                            </LemonField>

                            {batchExportConfigForm.encryption == 'aws:kms' && (
                                <LemonField name="kms_key_id" label="AWS KMS Key ID" className="flex-1">
                                    <LemonInput
                                        placeholder={
                                            isNew ? 'e.g. 1234abcd-12ab-34cd-56ef-1234567890ab' : 'leave unchanged'
                                        }
                                    />
                                </LemonField>
                            )}
                        </div>

                        <LemonField name="exclude_events" label="Events to exclude" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to exclude from the export (optional)"
                            />
                        </LemonField>
                        <LemonField name="include_events" label="Events to include" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to include in the export (optional)"
                            />
                        </LemonField>
                    </>
                ) : batchExportConfigForm.destination === 'Snowflake' ? (
                    <>
                        <LemonField name="user" label="User">
                            <LemonInput placeholder="my-user" />
                        </LemonField>

                        <LemonField name="password" label="Password">
                            <LemonInput placeholder="my-password" type="password" />
                        </LemonField>

                        <LemonField name="account" label="Account">
                            <LemonInput placeholder="my-account" />
                        </LemonField>

                        <LemonField name="database" label="Database">
                            <LemonInput placeholder="my-database" />
                        </LemonField>

                        <LemonField name="warehouse" label="Warehouse">
                            <LemonInput placeholder="my-warehouse" />
                        </LemonField>

                        <LemonField name="schema" label="Schema">
                            <LemonInput placeholder="my-schema" />
                        </LemonField>

                        <LemonField name="table_name" label="Table name">
                            <LemonInput placeholder="events" />
                        </LemonField>

                        <LemonField name="role" label="Role" showOptional>
                            <LemonInput placeholder="my-role" />
                        </LemonField>

                        <LemonField name="exclude_events" label="Events to exclude" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to exclude from the export (optional)"
                            />
                        </LemonField>
                        <LemonField name="include_events" label="Events to include" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to include in the export (optional)"
                            />
                        </LemonField>
                    </>
                ) : batchExportConfigForm.destination === 'Postgres' ? (
                    <>
                        <LemonField name="user" label="User">
                            <LemonInput placeholder="my-user" />
                        </LemonField>

                        <LemonField name="password" label="Password">
                            <LemonInput placeholder="my-password" type="password" />
                        </LemonField>

                        <LemonField name="host" label="Host">
                            <LemonInput placeholder="my-host" />
                        </LemonField>

                        <LemonField name="port" label="Port">
                            <LemonInput placeholder="5432" type="number" min="0" max="65535" />
                        </LemonField>

                        <LemonField name="database" label="Database">
                            <LemonInput placeholder="my-database" />
                        </LemonField>

                        <LemonField name="schema" label="Schema">
                            <LemonInput placeholder="public" />
                        </LemonField>

                        <LemonField name="table_name" label="Table name">
                            <LemonInput placeholder="events" />
                        </LemonField>

                        <LemonField name="has_self_signed_cert">
                            <LemonCheckbox
                                bordered
                                label={
                                    <span className="flex items-center gap-2">
                                        Does your Postgres instance have a self-signed SSL certificate?
                                        <Tooltip title="In most cases, Heroku and RDS users should check this.">
                                            <IconInfo className=" text-lg text-muted-alt" />
                                        </Tooltip>
                                    </span>
                                }
                            />
                        </LemonField>

                        <LemonField name="exclude_events" label="Events to exclude" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to exclude from the export (optional)"
                            />
                        </LemonField>
                        <LemonField name="include_events" label="Events to include" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to include in the export (optional)"
                            />
                        </LemonField>
                    </>
                ) : batchExportConfigForm.destination === 'Redshift' ? (
                    <>
                        <LemonField name="user" label="User">
                            <LemonInput placeholder="my-user" />
                        </LemonField>

                        <LemonField name="password" label="Password">
                            <LemonInput placeholder="my-password" type="password" />
                        </LemonField>

                        <LemonField name="host" label="Host">
                            <LemonInput placeholder="my-host" />
                        </LemonField>

                        <LemonField name="port" label="Port">
                            <LemonInput placeholder="5439" type="number" min="0" max="65535" />
                        </LemonField>

                        <LemonField name="database" label="Database">
                            <LemonInput placeholder="my-database" />
                        </LemonField>

                        <LemonField name="schema" label="Schema">
                            <LemonInput placeholder="public" />
                        </LemonField>

                        <LemonField name="table_name" label="Table name">
                            <LemonInput placeholder="events" />
                        </LemonField>

                        <LemonField name="properties_data_type" label="Properties data type">
                            <LemonSelect
                                options={[
                                    { value: 'varchar', label: 'VARCHAR(65535)' },
                                    { value: 'super', label: 'SUPER' },
                                ]}
                                value="varchar"
                            />
                        </LemonField>

                        <LemonField name="exclude_events" label="Events to exclude" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to exclude from the export (optional)"
                            />
                        </LemonField>
                        <LemonField name="include_events" label="Events to include" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to include in the export (optional)"
                            />
                        </LemonField>
                    </>
                ) : batchExportConfigForm.destination === 'BigQuery' ? (
                    <>
                        <LemonField name="json_config_file" label="Google Cloud JSON key file">
                            <LemonFileInput accept=".json" multiple={false} />
                        </LemonField>

                        <LemonField name="table_id" label="Table ID">
                            <LemonInput placeholder="events" />
                        </LemonField>

                        <LemonField name="dataset_id" label="Dataset ID">
                            <LemonInput placeholder="dataset" />
                        </LemonField>

                        {isNew ? (
                            <LemonField name="use_json_type" label="Structured fields data type">
                                <LemonCheckbox
                                    bordered
                                    label={
                                        <span className="flex items-center gap-2">
                                            Export 'properties', 'set', and 'set_once' fields as BigQuery JSON type
                                            <Tooltip title="If left unchecked, these fields will be sent as STRING type. This setting cannot be changed after batch export is created.">
                                                <IconInfo className=" text-lg text-muted-alt" />
                                            </Tooltip>
                                        </span>
                                    }
                                />
                            </LemonField>
                        ) : null}

                        <LemonField name="exclude_events" label="Events to exclude" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to exclude from the export (optional)"
                            />
                        </LemonField>
                        <LemonField name="include_events" label="Events to include" className="flex-1">
                            <LemonSelectMultiple
                                mode="multiple-custom"
                                options={[]}
                                placeholder="Input one or more events to include in the export (optional)"
                            />
                        </LemonField>
                    </>
                ) : null}
            </div>
        </>
    )
}
