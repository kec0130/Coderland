import to from "../utils/awaitTo";
import toast from "../utils/toast";

export default async function useApi<T extends ISuccessResponse>(
  promiseData: Promise<T | IFailResponse>
): Promise<T | undefined> {
  const [err, data] = await to(promiseData);

  if (err || !data) {
    toast(err?.message || "오류가 발생했습니다");
    return;
  }

  if (data.isOk === false) {
    toast("API를 정상적으로 호출하지 못했습니다");
    return;
  }

  if (data.hasNewNotification) {
    window.setHasNewNotification?.(true);
  }

  // eslint-disable-next-line consistent-return
  return data;
}
