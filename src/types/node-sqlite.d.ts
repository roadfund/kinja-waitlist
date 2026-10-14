declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string);
    prepare(sql: string): StatementSync;
  }

  export class StatementSync {
    run(...params: Array<string | null>): unknown;
    get(...params: Array<string | null>): unknown;
    all(): unknown[];
  }
}
