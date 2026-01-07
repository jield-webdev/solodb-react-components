export async function registerBadge(serverURL: string, badgeUID: string): Promise<string> {
    const url = serverURL + "/api/register-badge"

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            badge_uid: badgeUID,
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    });

    if (!response.ok) {
        throw new Error(`Response status: ${response.status} with body: ${await response.text()}`);
        return ""
    }

    const respText = await response.text();

    return respText
}
