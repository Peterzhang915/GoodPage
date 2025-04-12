    // src/hooks/useKonamiCode.ts
    import { useState, useEffect, useCallback } from 'react';

    const KONAMI_CODE = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a', 'b', 'a',
    ];

    export const useKonamiCode = (callback: () => void): void => {
      const [sequence, setSequence] = useState<string[]>([]);

      const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const key = event.key;
        const currentSequenceLength = sequence.length;

        // 检查当前按键是否是序列中期望的下一个键
        if (key === KONAMI_CODE[currentSequenceLength]) {
          // 如果匹配，添加到序列
          const newSequence = [...sequence, key];
        setSequence(newSequence);

          // 检查是否完成整个 Konami Code
          if (newSequence.length === KONAMI_CODE.length) {
            console.log('Konami Code Activated (BABA version)!');
          callback();
            setSequence([]); // 完成后重置
          }
        } else {
          // 如果不匹配
          // 检查新按键是否是 Konami Code 的第一个键
          if (key === KONAMI_CODE[0]) {
            // 如果是第一个键，则开始新的序列
            setSequence([key]);
          } else {
            // 如果不是第一个键，完全重置序列
            setSequence([]);
          }
        }
      }, [sequence, callback]);

      useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        // 清理函数：组件卸载时移除事件监听器
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      }, [handleKeyDown]); // 依赖项包含 handleKeyDown
    };