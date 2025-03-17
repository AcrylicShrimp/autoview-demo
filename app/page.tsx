'use client';

import { IAutoViewAgentProvider } from '@autoview/agent';
import { throttle } from 'lodash';
import { ChangeEvent, useState, useCallback } from 'react';
import typia from 'typia';

import * as defaultSchema from './default-schema.json';

export default function Home() {
  const [schema, setSchema] = useState<string>(
    JSON.stringify(defaultSchema, null, 2)
  );
  const [isCheckingSchema, setIsCheckingSchema] = useState<boolean>(false);
  const [isSchemaValid, setIsSchemaValid] = useState<boolean>(true);

  const checkSchemaThrottled = useCallback(
    throttle(checkSchema, 2000, { leading: false, trailing: true }),
    []
  );

  function onSchemaChanged(event: ChangeEvent<HTMLTextAreaElement>): void {
    setSchema(event.target.value);
    setIsCheckingSchema(true);
    checkSchemaThrottled();
  }

  function checkSchema(): void {
    try {
      const value = JSON.parse(schema);
      typia.assertGuard<IAutoViewAgentProvider.IChatGpt>(value);

      setIsCheckingSchema(false);
      setIsSchemaValid(true);
    } catch (error: unknown) {
      console.warn(error);
      setIsCheckingSchema(false);
      setIsSchemaValid(false);
    }
  }

  function renderProceedButton() {
    if (isCheckingSchema) {
      return (
        <button
          className="px-4 py-3 rounded bg-zinc-500 text-white mt-4"
          disabled
        >
          Validating Schema...
        </button>
      );
    }

    if (isSchemaValid) {
      <button className="px-4 py-3 rounded bg-blue-500 text-white mt-4">
        Generate Component
      </button>;
    }

    return (
      <button className="px-4 py-3 rounded bg-red-400 text-black mt-4" disabled>
        Invalid Schema
      </button>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <textarea
        className="w-full rounded px-2 py-1 text-black"
        placeholder="Place your schema here"
        value={schema}
        onChange={onSchemaChanged}
      ></textarea>
      {renderProceedButton()}
    </main>
  );
}
