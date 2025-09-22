import { useCallback, useEffect, useState } from "react";
import { runOnServer, CompileRunRequest, CompileRunResponse , Judge0Languages, listLanguages} from "@/services/complierService";

export function useCompiler() {
    const [language, setLanguage] = useState<string>('javascript');
    const [languageId, setLanguageId] = useState<number>(63);
    const [stdin, setStdin] = useState('');
    const [code, setCode] = useState('// Start coding together...');
    const [output, setOutput] = useState('Output will appear here...');
    const [isRunning, setIsRunning] = useState(false);

    const [languages, setLanguages] = useState<Judge0Languages[]>([]);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const list = await listLanguages();
                if (mounted) setLanguages(list);
            } catch {}
        })();
        return () => { mounted = false; };
    }, []);

    const runCode = useCallback(async (): Promise<string> => {
        setIsRunning(true)
        setOutput('Running...')
        const payload: CompileRunRequest = {
            source: code,
            languageId,
            stdin
        }
        try {
            const res: CompileRunResponse = await runOnServer(payload)
            const parts = [
                res.stdout ? `STDOUT:\n${res.stdout}` : '',
                res.stderr ? `STDERR:\n${res.stderr}` : '',
                res.compile_output ? `COMPILE:\n${res.compile_output}` : '',
                res.message ? `MESSAGE:\n${res.message}` : '',
                res.status ? `STATUS: ${res.status.description}` : '',
            ].filter(Boolean)
            const text = parts.join('\n\n').trim() || 'No output'
            setOutput(text)
            return text
        } catch (error: any) {
            const text = `Run failed: ${error?.message ?? String(error)}`
            setOutput(text)
            return text
        } finally {
            setIsRunning(false)
        }
    }, [code, languageId, stdin])

    return {
        language,
        setLanguage,
        languageId,
        setLanguageId,
        languages,
        stdin,
        setStdin,
        code,
        setCode,
        output,
        setOutput,
        isRunning,
        runCode,
    };

}