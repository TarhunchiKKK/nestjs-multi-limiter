export type SubscriptionTypes = "standard" | "pro";

export type Languages = "ru" | "en";

export type User = {
    id: string;
    name: string;
    language: Languages;
    subscriptionType: SubscriptionTypes;
};
