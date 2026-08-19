local key = KEYS[1]
local limit = tonumber(ARGV[1])
local ttl = ARGV[2]

local current = redis.call('incr', key)

if current == 1 then
    redis.call('pexpire', key, ttl)
end

if current <= limit then
    return 1
else
    return 0
end