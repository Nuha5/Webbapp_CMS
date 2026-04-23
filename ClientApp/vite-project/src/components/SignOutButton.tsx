import { readMeta } from "../ui/meta";

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "";
}

export function SignOutButton({
    className = "secondary",
    formClassName,
}: {
    className?: string;
    formClassName?: string;
}) {
    const csrfToken = getCsrfToken();
    const buttonText = readMeta("signout-button-text", "Sign out");

    return (
        <form method="post" action="/logout" className={formClassName} style={formClassName ? undefined : { margin: 0 }}>
            <input type="hidden" name="__RequestVerificationToken" value={csrfToken} />
            <button className={className} type="submit">
                {buttonText}
            </button>
        </form>
    );
}
