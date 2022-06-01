import { useNotificationContext } from 'src/shared/contexts/notification';

export const SuccessAlert = ({ text }: { text: string }) => (
  <div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-current flex-shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>{text}</span>
  </div>
);

export const FailedAlert = ({ text }: { text: string }) => (
  <div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-current flex-shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <span>{text}</span>
  </div>
);

const NotificationsContainer = () => {
  const { notifications } = useNotificationContext();

  return (
    <div className="fixed bottom-0 right-1/2 translate-x-1/2 w-1/2 z-10">
      {notifications.map((n, i) => (
        <div
          key={n.type + n.text.replace(/\s/g, '-') + '-' + n.id}
          className={`relative mb-4 shadow-lg alert ${n.type === 'success' ? 'alert-success' : 'alert-warning'}`}
          style={{
            // animation: 'slideInFromBottom 0.3s ease-out 0s 1',
            animation: 'alertInFromBottom 0.3s ease-out 0s 1 forwards, alertOutToBottom 0.3s linear 3s 1 forwards',
          }}
        >
          {n.type === 'success' ? <SuccessAlert text={n.text} /> : <FailedAlert text={n.text} />}
        </div>
      ))}
    </div>
  );
};

export default NotificationsContainer;
