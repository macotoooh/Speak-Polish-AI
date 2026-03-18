import { useEffect } from "react";
import type { Preview } from "@storybook/react";
import "../app/globals.css";

function StorybookThemeFrame({
  backgroundValue,
  children,
}: {
  backgroundValue?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const nextTheme = backgroundValue === "#f7f8fa" ? "light" : "dark";

    root.setAttribute("data-theme", nextTheme);

    return () => {
      root.removeAttribute("data-theme");
    };
  }, [backgroundValue]);

  return (
    <div className="min-w-[320px] bg-background p-6 text-foreground">
      {children}
    </div>
  );
}

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "#0b1220" },
        { name: "light", value: "#f7f8fa" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
  decorators: [
    (Story, context) => (
      <StorybookThemeFrame backgroundValue={context.globals.backgrounds?.value}>
        <Story />
      </StorybookThemeFrame>
    ),
  ],
};

export default preview;
