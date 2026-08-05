export type SubscriptionTypes = "community" | "standard" | "pro";

export type Languages = "ru" | "en" | "fr";

export type User = {
    id: string;
    name: string;
    language: Languages;
    subscriptionType: SubscriptionTypes;
};
