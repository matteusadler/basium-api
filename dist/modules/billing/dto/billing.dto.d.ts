export declare enum PaymentMethod {
    CARD = "card",
    BOLETO = "boleto",
    APPLE_PAY = "apple_pay",
    GOOGLE_PAY = "google_pay"
}
export declare class CreateCheckoutSessionDto {
    planId: string;
    yearly?: boolean;
    paymentMethod?: PaymentMethod;
    successUrl?: string;
    cancelUrl?: string;
}
export declare class CreatePortalSessionDto {
    returnUrl?: string;
}
export declare class UpdatePaymentMethodDto {
    paymentMethodId: string;
}
