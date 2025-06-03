import redis from "@/workloads/redis";
import { Redis as IORedis } from "ioredis";

export const redisClient = new IORedis(process.env[redis.connectionStringEnvVar]!, {
	lazyConnect: true,
});
