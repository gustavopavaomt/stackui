import type { ReactNode } from "react";

export type ContentUnavailableViewProps = {
  title: string;
  /** A large symbol above the title. */
  icon?: ReactNode;
  description?: ReactNode;
  /** Buttons under the text (e.g. "Try again"). */
  actions?: ReactNode;
};

/** The empty state: nothing here yet, no results, no connection. Give each list its own sentence. */
export function ContentUnavailableView({ title, icon, description, actions }: ContentUnavailableViewProps) {
  return (
    <section aria-label={title} className="st-unavailable">
      {icon && (
        <span className="st-unavailable__icon" aria-hidden>
          {icon}
        </span>
      )}
      <h2 className="st-unavailable__title">{title}</h2>
      {description && <p className="st-unavailable__description">{description}</p>}
      {actions && <div className="st-unavailable__actions">{actions}</div>}
    </section>
  );
}
