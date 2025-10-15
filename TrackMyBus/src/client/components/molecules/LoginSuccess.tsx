import styles from "../../styles/css/loginsuccess.module.css";

export default function LoginSuccess() {
  const roles = [
    {
      id: "driver",
      title: "Driver",
      icon: "🧑‍✈️",
      desc: "Continue to your dashboard",
      path: "/driver",
    },
    {
      id: "student",
      title: "Student",
      icon: "🎒",
      desc: "Track your bus and arrival times",
      path: "/student",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome to TrackMyBus</h1>
        <p className={styles.subtitle}>Choose your role to continue</p>
      </header>

      <main className={styles.grid}>
        {roles.map((r) => (
          <article
            key={r.id}
            className={styles.card}
            role="button"
            tabIndex={0}
            aria-label={r.title}
            onClick={() => (window.location.href = r.path)}
          >
            <div className={styles.emoji} aria-hidden>
              {r.icon}
            </div>
            <h2 className={styles.cardTitle}>{r.title}</h2>
            <p className={styles.cardDesc}>{r.desc}</p>
          </article>
        ))}
      </main>
    </div>
  );
}
