import { helper } from "./helper.js";
import { _, Job, Worker } from "../config/imports.js";
import { logger } from "../config/loki.js";
import { bullMQConnectionObject } from "../config/redis.js";
import { retryEmailVerification, saveInRedisQueueEmployee } from "./queue.js";
import { AddJobToQueueLabelInterface, RegisterWorkerLabelInterface } from "../interface/logger.js";
import { Constants } from "./constants.js";

interface QueueInterface {
    addJobToQueue(tracerId: string, labels, queueWorker: string, params: {}, maxAttempts?: number, lockDuration?: number, backOffDelay?: number): Promise<void>;
}

const queueMap = {
    [Constants.DB.SAVE_IN_REDIS]: saveInRedisQueueEmployee,
    [Constants.QUEUE_DB.EMAIL_VERIFICATION]: retryEmailVerification,
};

class QueueImpl implements QueueInterface {
    private workers: Map<string, Worker> = new Map();

    async addJobToQueue(tracerId: string, labels, queueWorker: string, params: {}, maxAttempts?: number, jobTimeout?: number, lockDuration?: number, backOffDelay?: number): Promise<void> {
        const queue = queueMap[queueWorker];

        if (!queue) throw new Error(`Queue ${queueWorker} not found.`);
        
        const queueJobConfig = {
            attempts: _.defaultTo(maxAttempts, Constants.QUEUE_DB.MAX_ATTEMPTS),
            backoff: {
                type: Constants.QUEUE_DB.BACKOFF_EXPONENTIAL,
                delay: _.defaultTo(backOffDelay, Constants.QUEUE_DB.BACKOFF_DELAY)
            },
            timeout: _.defaultTo(jobTimeout, Constants.QUEUE_DB.JOB_TIMEOUT),
            lockDuration: _.defaultTo(lockDuration, Constants.QUEUE_DB.LOCK_DURATION),
        };
        
        const queueLabel: AddJobToQueueLabelInterface = {
            operation: labels.operation,
            subOperation: Constants.LOKI_LOGGER_LABELS.ADD_JOB_TO_QUEUE,
            type: labels.type,
        };
        let loggerDefaultParams = {};
        let logPayload = {
            labels,
            params,
            queueLabel,
            queueJobConfig,
        };
        
        try {
            await queue.add(queueWorker, {
                params,
                tracerId,
                queueLabel,
            }, queueJobConfig);

            loggerDefaultParams = helper.generateDefaultSuccessParams(tracerId, Constants.LOKI_LOGGER_LABELS.QUEUE);
            logPayload = { ...logPayload, ...loggerDefaultParams };
        }
        catch (error) {
            loggerDefaultParams = helper.generateDefaultFailureParams(tracerId, Constants.LOKI_LOGGER_LABELS.QUEUE);
            logPayload = { ...logPayload, ...loggerDefaultParams };
            logPayload = helper.logErrorStack(logPayload, error);
            logger.error({ ...logPayload });

            throw error;
        }

        logger.info({ ...logPayload });
    }

    startWorkers() {
        this.registerWorker(Constants.DB.SAVE_IN_REDIS, async (job: Job) => {
            const { params, tracerId, queueLabel } = job.data;
            const { key, value, timeout } = params;

            const registerWorkerLabel: RegisterWorkerLabelInterface = {
                operation: queueLabel.operation,
                subOperation: Constants.LOKI_LOGGER_LABELS.REGISTER_JOB,
                type: queueLabel.type
            };
            let loggerDefaultParams = {};
            let logPayload = {
                registerWorkerLabel,
                params,
                distributedTraceId: tracerId,
            };

            try {
                await helper.setRedis(tracerId, registerWorkerLabel, key, helper.serialiseRedisKeyValues(value), timeout);
            }
            catch (error) {
                loggerDefaultParams = helper.generateDefaultFailureParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, Constants.DB.SAVE_IN_REDIS);
                logPayload = { ...logPayload, ...loggerDefaultParams };
                logPayload = helper.logErrorStack(logPayload, error);
                logger.error({ ...logPayload });

                throw new Error(error);
            }
        });

        this.registerWorker(Constants.QUEUE_DB.EMAIL_VERIFICATION, async (job: Job) => {
            const { params, tracerId, queueLabel } = job.data;
            const { token, name, email } = params;

            const registerWorkerLabel: RegisterWorkerLabelInterface = {
                operation: queueLabel.operation,
                subOperation: Constants.LOKI_LOGGER_LABELS.REGISTER_JOB,
                type: queueLabel.type
            };
            let loggerDefaultParams = {};
            let logPayload = {
                registerWorkerLabel,
                params,
                distributedTraceId: tracerId,
            };

            try {
                await helper.sendEmailForVerification(tracerId, {
                    token: token,
                    user: {
                        name: name,
                        email: email
                    }
                }, registerWorkerLabel);
            }
            catch (error) {
                loggerDefaultParams = helper.generateDefaultFailureParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, Constants.QUEUE_DB.EMAIL_VERIFICATION);
                logPayload = { ...logPayload, ...loggerDefaultParams };
                logPayload = helper.logErrorStack(logPayload, error);
                logger.error({ ...logPayload });

                throw error;
            }
        });
    }

    private registerWorker(queueName: string, processor: (job: Job) => Promise<void>) {
        const worker = new Worker(queueName, processor, {
            connection: bullMQConnectionObject.connection,
            lockDuration: helper.convertToType<number>(Constants.QUEUE_DB.LOCK_DURATION, Constants.TYPE_SWITCH.NUMBER),
            concurrency: helper.convertToType<number>(Constants.QUEUE_DB.CONCURRENCY, Constants.TYPE_SWITCH.NUMBER),
        });

        this.workers.set(queueName, worker);
        let loggerDefaultParams = {};
        let logPayload = {
            queueName,
        };
        
        worker.on('completed', job => {
            const { tracerId, queueLabel } = job?.data || {};

            loggerDefaultParams = helper.generateDefaultSuccessParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, Constants.LOKI_LOGGER_LABELS.PERFORM_JOB);
            logPayload = { ...logPayload, ...loggerDefaultParams };
            logPayload = { ...logPayload, ...queueLabel };
            logPayload = { ...logPayload, ...tracerId };
            logPayload = { ...logPayload, ...job };
            logger.info({ ...logPayload });
        });

        worker.on('failed', (job, error) => {
            // DLQ Implementation
            const { tracerId, queueLabel } = job?.data || {};

            loggerDefaultParams = helper.generateDefaultFailureParams(tracerId, Constants.LOKI_LOGGER_LABELS.WORKER, Constants.LOKI_LOGGER_LABELS.FAILED_JOB);
            logPayload = { ...logPayload, ...loggerDefaultParams };
            logPayload = { ...logPayload, ...queueLabel };
            logPayload = { ...logPayload, ...tracerId };
            logPayload = { ...logPayload, ...job };
            logPayload = helper.logErrorStack(logPayload, error);
            logger.error({ ...logPayload });
        });
    }
}

export const queueEmployee = new QueueImpl();
