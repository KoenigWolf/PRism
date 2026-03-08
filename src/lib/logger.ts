import * as Sentry from "@sentry/nextjs";

export function captureError(
  error: unknown,
  context?: Record<string, unknown>
) {
  console.error("[PRism Error]", error);

  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, {
      extra: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// テナントコンテキスト付きログ
export function captureErrorWithTenant(
  error: unknown,
  tenantId: string,
  context?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    scope.setTag("tenantId", tenantId);
    captureError(error, context);
  });
}
