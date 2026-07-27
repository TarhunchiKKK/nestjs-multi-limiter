local key = KEYS[1]
local startTime = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clearBefore = startTime - windowMs

-- Remove old timestamps
redis.call('zremrangebyscore', key, 0, clearBefore)

-- Get remaining requests count in window
local currentCount = redis.call('zcard', key)

-- Less than limit -> add current request
if currentCount < limit then
    redis.call('zadd', key, startTime, ARGV[1] .. ":" .. ARGV[4])
    redis.call('pexpire', key, windowMs)
    return 1
else
    return 0
end
