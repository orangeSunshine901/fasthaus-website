import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import styles from "./AfterHours.module.css";

export default function AfterHoursSection() {
  return (
    <section id="after-hours" className={styles.section} aria-labelledby="after-hours-heading">
      <div className={`container-page ${styles.layout}`}>
        <div className={styles.copy}>
          <h2 id="after-hours-heading">After hours<span aria-hidden="true">.</span></h2>
          <p>The studio is quiet. The lamps have stories.</p>
          <p>Meet the keeper, follow the clues, and find the light in a small digital experiment by Fasthaus.</p>
          <a href="/after-hours" className={`btn btn-primary ${styles.play}`}>Play After Hours <ArrowUpRight size={20} aria-hidden="true" /></a>
          <span className={styles.note}>About a minute. Play in English or Arabic.</span>
        </div>
        <a href="/after-hours" className={styles.preview} aria-label="Enter the After Hours game">
          <Image src="/after-hours-studio.png" alt="Four pixel-art Fasthaus lamps on the shelves of the studio after dark" width={960} height={408} sizes="(min-width: 1024px) 56vw, 100vw" />
          <span className={styles.caption}>THE STUDIO <span>AFTER HOURS</span><ArrowUpRight size={18} aria-hidden="true" /></span>
        </a>
      </div>
    </section>
  );
}
