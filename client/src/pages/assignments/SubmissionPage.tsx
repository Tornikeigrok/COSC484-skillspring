import { Dialog, DialogClose, DialogContent, DialogTitle, DialogDescription } from "@/ui/radix-modal";
import { Button } from "@/components/ui";
import styles from "./SubmissionPage.module.css";

interface SubmissionPageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmissionPage = ({ open, onOpenChange }: SubmissionPageProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <div className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <DialogTitle>Work submitted</DialogTitle>
      <DialogDescription>
        Your submission was sent to the company. We'll notify you once they've reviewed it.
      </DialogDescription>
      <div className={styles.footer}>
        <DialogClose asChild>
          <Button className={styles.done}>Done</Button>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
);

export default SubmissionPage;
