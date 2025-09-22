'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as Y from 'yjs';
// y-webrtc provider (peer-to-peer Yjs sync)
import { WebrtcProvider } from 'y-webrtc';
// y-monaco binding for collaborative cursors/edits
// If not installed, run: npm i y-monaco
import { MonacoBinding } from 'y-monaco';

const Monaco = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CollaborativeEditorProps {
  roomId: string;
  initialCode?: string;
  language?: string; // e.g. 'javascript', 'python', 'cpp', etc.
  onChangeCode?: (code: string) => void;
  sendSignal?: (msg: any) => void;
  onSignal?: (cb: (msg: any) => void) => () => void;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  roomId,
  initialCode = '',
  language = 'javascript',
  onChangeCode,
  sendSignal,
  onSignal,
}) => {
  const [ready, setReady] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const monacoModelRef = useRef<import('monaco-editor').editor.ITextModel | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressLocalRef = useRef(false);

  // stable room name for Yjs
  const yRoom = useMemo(() => `webrtc-${roomId}-editor`, [roomId]);

  const monacoRef = useRef<any>(null);

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    // Create model if not already
    if (!monacoModelRef.current) {
      monacoModelRef.current = monaco.editor.createModel('', language);
    }
    editor.setModel(monacoModelRef.current);

    // init Yjs doc and provider once
    if (!ydocRef.current) {
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      const provider = new WebrtcProvider(yRoom, ydoc, {
        // Explicit signaling server to ensure peers can discover each other
        signaling: ['wss://signaling.yjs.dev'],
        // If needed, you can pass custom ICE servers (TURN/STUN) via peerOpts
        // peerOpts: { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] } },
      });
      providerRef.current = provider;

      const ytext = ydoc.getText('monaco');
      ytextRef.current = ytext;

      // initialize with initialCode only if empty
      if (ytext.length === 0 && initialCode) {
        ytext.insert(0, initialCode);
      }

      // Bind Y.Text <-> Monaco model
      bindingRef.current = new MonacoBinding(
        ytext,
        monacoModelRef.current!,
        new Set([editor]),
        provider.awareness
      );
      setReady(true);
    }

    // Hook local change to pass to parent if needed
    const sub = monacoModelRef.current!.onDidChangeContent(() => {
      const value = monacoModelRef.current!.getValue();
      if (onChangeCode) onChangeCode(value);

      // Fallback sync via data channel (debounced)
      if (sendSignal && !suppressLocalRef.current) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          try {
            sendSignal({ type: 'compiler:code', code: value });
          } catch {}
        }, 120);
      }
    });

    editor.onDidDispose(() => sub.dispose());
  }, [language, onChangeCode, yRoom, initialCode, sendSignal]);

  // Switch Monaco model language when prop changes
  useEffect(() => {
    const monaco = monacoRef.current;
    if (monaco && monacoModelRef.current) {
      try {
        monaco.editor.setModelLanguage(monacoModelRef.current, language);
      } catch {}
    }
  }, [language]);

  useEffect(() => {
    if (!onSignal) return;
    const off = onSignal((msg: any) => {
      if (msg?.type === 'compiler:code' && monacoModelRef.current) {
        const current = monacoModelRef.current.getValue();
        if (msg.code !== current) {
          suppressLocalRef.current = true;
          monacoModelRef.current.setValue(msg.code);
          suppressLocalRef.current = false;
        }
      }
    });
    return () => { try { off?.(); } catch {} };
  }, [onSignal]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      try {
        bindingRef.current?.destroy();
      } catch {}
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
      monacoModelRef.current?.dispose();
      bindingRef.current = null;
      providerRef.current = null;
      ydocRef.current = null;
      monacoModelRef.current = null;
    };
  }, []);

  return (
    <div className="h-full w-full">
      <Monaco
        height="100%"
        defaultLanguage={language}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
          theme: 'vs-dark',
        }}
        onMount={handleEditorMount}
      />
    </div>
  );
};
