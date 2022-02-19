import instance from "./instance";

export function getNotification(): Promise<
  INotificationResponse | IFailResponse
> {
  return instance.get("/users/notification");
}

export function addPushEndPoint(
  subscription: PushSubscription
): Promise<ISuccessResponse | IFailResponse> {
  return instance.post("/users/push", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription }),
  });
}

export function removePushPoint(
  subscription: PushSubscription
): Promise<ISuccessResponse | IFailResponse> {
  return instance.delete("/users/push", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription }),
  });
}
