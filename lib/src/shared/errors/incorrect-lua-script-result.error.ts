export class IncorrectLuaScriptResultError extends Error {
    public constructor(value: unknown) {
        const message = `Incorrect return value of Lua-script. Expected 0 or 1, but receive ${value}`;

        super(message);
    }
}
