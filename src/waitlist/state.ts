export type JoinState = { status: "idle" } | { status: "joined"; firstName: string; email: string } | { status: "error"; message: string };
