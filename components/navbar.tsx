import { ConnectButton } from "thirdweb/react";
import { client } from "../lib/client"; // adjust path if needed
import styles from "../styles/Home.module.css";
import Link from "next/link";

// If you defined primordialTestnet in _app.tsx, move it to lib/client.ts and import it here as well
import { primordialTestnet } from "../lib/client";

export default function Navbar() {
  return (
    <div className={styles.navbar}>
      <Link href="/">
        <p
          className={styles.gradientText1}
          style={{
            cursor: "pointer",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          TREKERS BUILDER SETS
        </p>
      </Link>
      <ConnectButton
        client={client}
        chain={primordialTestnet}
        theme="dark"
        connectButton={{
          label: "Sign In",
        }}
        connectModal={{
          title: "Select sign in method",
          size: "wide",
        }}
        detailsButton={{
          render: () => <p>Profile</p>,
        }}
      />
    </div>
  );
}
