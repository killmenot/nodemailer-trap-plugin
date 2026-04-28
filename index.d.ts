declare module 'nodemailer-trap-plugin' {
  export type TrapPassthrough =
    | string
    | RegExp
    | ((toAddress: string) => boolean)
    | false;

  export interface TrapOptions {
    to?: string;
    subject?: string;
    passthrough?: TrapPassthrough;
  }

  export interface TrapMail {
    data: {
      to?: string | { name?: string; address: string } | Array<string | { name?: string; address: string }>;
      subject?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  export type TrapPlugin = (
    mail: TrapMail,
    callback: (err?: Error | null) => void
  ) => void;

  export function trap(options?: TrapOptions): TrapPlugin;
}
