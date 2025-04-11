    // src/hooks/useKonamiCode.ts
    import { useState, useEffect, useCallback } from 'react';

    const KONAMI_CODE = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a',
    ];

    export const useKonamiCode = (callback: () => void): void => {
      const [sequence, setSequence] = useState<string[]>([]);

      const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const key = event.key;
        // console.log('Key pressed:', key); // 用于调试

        // 将当前按键添加到序列末尾，并保持序列长度不超过 Konami Code 长度
        const newSequence = [...sequence, key].slice(-KONAMI_CODE.length);
        setSequence(newSequence);
        // console.log('Current sequence:', newSequence); // 用于调试

        // 检查新序列是否与 Konami Code 完全匹配
        if (newSequence.join('') === KONAMI_CODE.join('')) {
          console.log('Konami Code Activated!');
          callback();
          setSequence([]); // 重置序列
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