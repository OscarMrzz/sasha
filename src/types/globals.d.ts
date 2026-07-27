import "react";

declare module "react" {

    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        closedby?: "any" | "none" | string;
    }
}