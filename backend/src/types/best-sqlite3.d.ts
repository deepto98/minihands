declare module 'best-sqlite3' {
  export interface DatabaseOptions {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: (message?: any, ...additionalArgs: any[]) => void;
    nativeBinding?: string;
  }

  export interface Statement {
    run(...bindParameters: any[]): { changes: number; lastInsertRowid: number | bigint };
    get(...bindParameters: any[]): any;
    all(...bindParameters: any[]): any[];
    iterate(...bindParameters: any[]): IterableIterator<any>;
    pluck(toggleState?: boolean): this;
    expand(toggleState?: boolean): this;
    raw(toggleState?: boolean): this;
    columns(): any[];
    bind(...bindParameters: any[]): this;
  }

  export default class Database {
    constructor(filename: string | Buffer, options?: DatabaseOptions);
    prepare(source: string): Statement;
    transaction<T extends (...args: any[]) => any>(fn: T): T;
    exec(source: string): this;
    pragma(source: string, options?: { simple?: boolean }): any;
    backup(destinationFile: string, options?: { progress?: (info: { totalPages: number; remainingPages: number }) => number }): Promise<any>;
    function(name: string, cb: (...args: any[]) => any): this;
    function(name: string, options: { varargs?: boolean; deterministic?: boolean; safeIntegers?: boolean }, cb: (...args: any[]) => any): this;
    aggregate(name: string, options: any): this;
    table(name: string, factory: any): this;
    loadExtension(path: string): this;
    close(): this;
    defaultSafeIntegers(toggleState?: boolean): this;
    readonly name: string;
    readonly open: boolean;
    readonly inTransaction: boolean;
    readonly memory: boolean;
    readonly readonly: boolean;
  }
}
