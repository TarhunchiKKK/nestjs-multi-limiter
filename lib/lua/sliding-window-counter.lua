local key = KEYS[1]

local startTime = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

local currentWindowStart = math.floor(startTime / windowMs) * windowMs

-- Get stored state
local state = redis.call('hmget', key, 'windowStart', 'currentCount', 'previousCount')

local storedWindowStart = tonumber(state[1])
local currentCount = tonumber(state[2]) or 0
local previousCount = tonumber(state[3]) or 0

if not storedWindowStart then
    storedWindowStart = currentWindowStart
end

-- New window starts -> shift window
local timePassed = currentWindowStart - storedWindowStart

if timePassed == windowMs then
    previousCount = currentCount
    currentCount = 0
    storedWindowStart = currentWindowStart
elseif timePassed > windowMs then
    previousCount = 0
    currentCount = 0
    storedWindowStart = currentWindowStart
end

-- Calculate weight
local timeElapsedInCurrentWindow = startTime - currentWindowStart
local previousWindowWeight = 1 - (timeElapsedInCurrentWindow / windowMs)
local calculatedCount = currentCount + (previousCount * previousWindowWeight)

-- Check limit
if calculatedCount + 1 <= limit then
    currentCount = currentCount + 1
    redis.call('hmset', key, 'windowStart', storedWindowStart, 'currentCount', currentCount, 'previousCount', previousCount)
    redis.call('pexpire', key, windowMs * 2)
    return 1
else
    return 0
end
