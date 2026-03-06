import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  return (
    <main className="flex min-h-full flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <section className="ui-card max-w-xl rounded-lg p-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="ui-text-muted mt-1 text-sm">
          Choose how the app looks.
        </p>
        <ThemeToggle />
      </section>
    </main>
  );
}
