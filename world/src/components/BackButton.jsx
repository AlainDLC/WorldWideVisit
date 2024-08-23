import { useNavigate } from "react-router-dom";
import styles from "./Button.module.css";

export default function BackButton({ type, children }) {
  const navigate = useNavigate();
  return (
    <button
      className={`${styles.btn} ${styles[type]}`}
      type="back"
      onClick={(e) => {
        e.preventDefault();
        navigate(-1);
      }}
    >
      🔙 {children}
    </button>
  );
}
