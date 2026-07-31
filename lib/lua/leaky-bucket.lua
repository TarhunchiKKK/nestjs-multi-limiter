local key = KEYS[1]
local startTime = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local leakRate = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])

-- Get current state
local state = redis.call('hmget', key, 'water', 'lastLeaked')
local water = tonumber(state[1]) or 0
local lastLeaked = tonumber(state[2]) or startTime

-- Calculate leaked water
local elapsed = startTime - lastLeaked
local leakedWater = elapsed * leakRate
local currentWater = math.max(0, water - leakedWater)

-- Check capacity
if currentWater + 1 <= capacity then
    redis.call('hmset', key, 'water', currentWater + 1, 'lastLeaked', startTime)
    redis.call('pexpire', key, ttl)
    return 1
else
    local nextLastLeaked = tonumber(state[2]) or startTime
    redis.call('hmset', key, 'water', currentWater, 'lastLeaked', nextLastLeaked)
    redis.call('pexpire', key, ttl)
    return 0
end