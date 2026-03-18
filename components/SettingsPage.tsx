import FeedbackLanguageSelect from "@/components/FeedbackLanguageSelect";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  return (
    <main className="flex min-h-full flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>

      <section className="ui-card w-full max-w-xl rounded-lg p-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="ui-text-muted mt-1 text-sm">
          Choose how the app looks.
        </p>
        <ThemeToggle />
      </section>

      <section className="ui-card w-full max-w-xl rounded-lg p-4">
        <h2 className="text-lg font-semibold">Feedback Language</h2>
        <p className="ui-text-muted mt-1 text-sm">
          Choose which language the app uses for explanations and coaching
          comments.
        </p>
        <FeedbackLanguageSelect />
      </section>
    </main>
  );
}
