"use client";

import { MainAgent } from "@autoview/agent";
import { renderComponent } from "@autoview/ui";
import { IChatGptSchema } from "@samchon/openapi";
import { throttle } from "lodash";
import { OpenAI } from "openai";
import React, { ChangeEvent, useState, useCallback } from "react";
import typia from "typia";

import * as defaultSchema from "./default-schema.json";

export default function Home() {
  const [model, setModel] = useState<string>("o3-mini-2025-01-31");
  const [apiKey, setApiKey] = useState<string>("");
  const [schema, setSchema] = useState<string>(
    JSON.stringify(defaultSchema, null, 2)
  );
  const [isCheckingSchema, setIsCheckingSchema] = useState<boolean>(false);
  const [isSchemaValid, setIsSchemaValid] = useState<boolean>(true);
  const [isGeneratingComponent, setIsGeneratingComponent] =
    useState<boolean>(false);
  const [result, setResult] = useState<MainAgent.IResult | null>(null);

  const checkSchemaThrottled = useCallback(
    throttle(checkSchema, 2000, { leading: false, trailing: true }),
    []
  );

  function onModelChanged(event: ChangeEvent<HTMLSelectElement>): void {
    setModel(event.target.value);
  }

  function onApiKeyChanged(event: ChangeEvent<HTMLInputElement>): void {
    setApiKey(event.target.value);
  }

  function onSchemaChanged(event: ChangeEvent<HTMLTextAreaElement>): void {
    setSchema(event.target.value);
    setIsCheckingSchema(true);
    checkSchemaThrottled(event.target.value);
  }

  function checkSchema(schema: string): void {
    try {
      const value = JSON.parse(schema);
      typia.assertGuard<IChatGptSchema>(value);

      setIsCheckingSchema(false);
      setIsSchemaValid(true);
    } catch (error: unknown) {
      console.warn(error);
      setIsCheckingSchema(false);
      setIsSchemaValid(false);
    }
  }

  function renderProceedButton(): React.ReactNode {
    if (isCheckingSchema) {
      return (
        <button
          className="px-4 py-3 rounded bg-zinc-500 text-white mt-4 cursor-progress"
          disabled
        >
          Validating Schema...
        </button>
      );
    }

    if (isSchemaValid) {
      return (
        <button
          className="px-4 py-3 rounded bg-blue-500 text-white mt-4 cursor-pointer"
          onClick={generateComponent}
        >
          Generate Component
        </button>
      );
    }

    return (
      <button
        className="px-4 py-3 rounded bg-red-400 text-black mt-4 cursor-not-allowed"
        disabled
      >
        Invalid Schema
      </button>
    );
  }

  function renderGeneratingComponent(): React.ReactNode {
    if (!isGeneratingComponent) {
      return null;
    }

    return (
      <div className="absolute inset-0 flex flex-row items-center justify-center bg-black/60">
        Generating Component...
      </div>
    );
  }

  function renderResult(): React.ReactNode {
    if (!result) {
      return (
        <section className="w-full mt-6">
          <h2 className="text-2xl font-bold">Result</h2>
          <p className="w-full rounded px-2 py-4 text-zinc-400 bg-zinc-800 mt-2 text-center">
            Press "Generate Component" button to generate a component!
          </p>
        </section>
      );
    }

    return (
      <section className="w-full mt-6">
        <h2 className="text-2xl font-bold">Result</h2>
        <div className="w-full flex flex-col items-stretch justify-start">
          <section className="w-full flex flex-row items-center justify-start">
            <h3 className="text-lg font-bold">
              Component Rendered with Random Data
            </h3>
            <pre className="w-full rounded px-2 py-4 text-zinc-400 bg-zinc-800 mt-2">
              {/* here is where the magic happens */}
              {renderComponent(result.transform(result.random()))}
            </pre>
          </section>
          <section className="w-full flex flex-row items-center justify-start">
            <h3 className="text-lg font-bold">Visualization Planning</h3>
            <pre className="w-full rounded px-2 py-4 text-zinc-400 bg-zinc-800 mt-2">
              {result.visualizationPlanning}
            </pre>
          </section>
          <section className="w-full flex flex-row items-center justify-start">
            <h3 className="text-lg font-bold">Component Plan</h3>
            <pre className="w-full rounded px-2 py-4 text-zinc-400 bg-zinc-800 mt-2">
              {result.componentPlan}
            </pre>
          </section>
          <section className="w-full flex flex-row items-center justify-start">
            <h3 className="text-lg font-bold">Analysis</h3>
            <pre className="w-full rounded px-2 py-4 text-zinc-400 bg-zinc-800 mt-2">
              {result.analysis}
            </pre>
          </section>
        </div>
      </section>
    );
  }

  async function generateComponent(): Promise<void> {
    if (isGeneratingComponent) {
      return;
    }

    setIsGeneratingComponent(true);
    setResult(null);

    try {
      const result = await MainAgent.execute(
        {
          type: "chatgpt",
          api: new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true,
          }),
          model: model as any,
        },
        schema
      );

      setResult(result);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setIsGeneratingComponent(false);
    }
  }

  return (
    <main className="flex min-h-screen max-w-lg mx-auto flex-col gap-y-12 items-center justify-start px-2 py-24 relative">
      <h1 className="text-4xl font-bold">AutoView Demo</h1>
      <p className="text-base text-zinc-200 text-center">
        Put your server's response schema
        <br />
        and let AutoView generate a React component for you!
      </p>
      <p className="text-xs text-zinc-500 text-center">
        All operations are performed on your browser.
        <br />
        No data is sent to any server, except for the LLM providers (OpenAI).
      </p>
      <p className="text-xs text-zinc-500 text-center">
        It takes some time to generate the component (less than 1 minute in
        worst case). Please be patient.
      </p>
      {renderGeneratingComponent()}
      <section className="w-full">
        <h2 className="text-2xl font-bold">OpenAI Model</h2>
        <select
          className="w-full rounded px-2 py-1 text-white bg-zinc-800 mt-2"
          onChange={onModelChanged}
          value={model}
        >
          <option value="gpt-4.5-preview-2025-02-27">
            gpt-4.5-preview-2025-02-27
          </option>
          <option value="gpt-4o-2024-11-20">gpt-4o-2024-11-20</option>
          <option value="gpt-4o-mini-2024-07-18">gpt-4o-mini-2024-07-18</option>
          <option value="o1-2024-12-17">o1-2024-12-17</option>
          <option value="o1-mini-2024-09-12">o1-mini-2024-09-12</option>
          <option value="o3-mini-2025-01-31">o3-mini-2025-01-31</option>
        </select>
      </section>
      <section className="w-full">
        <h2 className="text-2xl font-bold">OpenAI API Token</h2>
        <input
          type="password"
          className="w-full rounded px-2 py-1 text-white bg-zinc-800 mt-2"
          placeholder="Enter your API token"
          value={apiKey}
          onChange={onApiKeyChanged}
        ></input>
      </section>
      <section className="w-full">
        <h2 className="text-2xl font-bold">Schema</h2>
        <textarea
          className="w-full rounded px-2 py-1 text-white bg-zinc-800 mt-2 text-sm"
          placeholder="Place your schema here"
          value={schema}
          onInput={onSchemaChanged}
        ></textarea>
        <section className="w-full flex flex-row items-center justify-end">
          {renderProceedButton()}
        </section>
      </section>
      {renderResult()}
    </main>
  );
}
