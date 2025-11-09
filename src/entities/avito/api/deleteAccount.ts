import { config } from "@/shared/lib/config";

export interface DeleteAccountError {
  message: string;
  statusCode: number;
}

export async function deleteAvitoAccount(
  tenantId: string,
  accountId: string
): Promise<void> {
  const url = `${config.apiBaseUrl}/oauth/accounts/${tenantId}/${accountId}`;

  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 404) {
      const error: DeleteAccountError = {
        message: "Тенант или аккаунт не найден",
        statusCode: 404,
      };
      throw error;
    }

    if (response.status === 400) {
      const error: DeleteAccountError = {
        message:
          "Невозможно удалить аккаунт. У аккаунта есть связанные данные (объявления, чаты и т.д.). Сначала необходимо их удалить.",
        statusCode: 400,
      };
      throw error;
    }

    const error: DeleteAccountError = {
      message: "Ошибка при удалении аккаунта",
      statusCode: response.status,
    };
    throw error;
  }
}

