import { useState } from 'react';
import Head from 'next/head';
import ReferenceDataUploader from '../components/ReferenceDataUploader';
import UserDataUploader from '../components/UserDataUploader';
import ResultsDisplay from '../components/ResultsDisplay';

export default function Home() {
  // 存储参考数据（subclass_label和subclass.markers.combo）
  const [referenceData, setReferenceData] = useState(null);
  
  // 存储用户输入数据（cluster和gene）
  const [userData, setUserData] = useState(null);
  
  // 匹配结果
  const [results, setResults] = useState(null);

  // 处理匹配逻辑
  const processMatching = () => {
    if (!referenceData || !userData) return;

    const matchResults = {};
    
    // 对每个cluster进行处理
    Object.keys(userData).forEach(cluster => {
      const clusterGenes = userData[cluster];
      const matchScores = {};
      
      // 计算每个subclass_label的匹配分数
      Object.keys(referenceData).forEach(subclass => {
        const referenceGenes = referenceData[subclass];
        
        // 计算匹配的基因数量
        const matchedGenes = clusterGenes.filter(gene => 
          referenceGenes.includes(gene)
        );
        
        // 计算匹配分数
        matchScores[subclass] = {
          matchedCount: matchedGenes.length,
          matchedGenes: matchedGenes,
          totalReferenceGenes: referenceGenes.length,
          score: matchedGenes.length / referenceGenes.length
        };
      });
      
      // 找出匹配分数最高的subclass
      let bestMatch = null;
      let highestScore = 0;
      
      Object.keys(matchScores).forEach(subclass => {
        if (matchScores[subclass].score > highestScore) {
          highestScore = matchScores[subclass].score;
          bestMatch = subclass;
        }
      });
      
      matchResults[cluster] = {
        bestMatch,
        highestScore,
        details: matchScores
      };
    });
    
    setResults(matchResults);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>基因分类匹配系统</title>
        <meta name="description" content="基因分类匹配系统" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-3xl font-bold mb-8 text-center">基因分类匹配系统</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">第1步：上传参考数据</h2>
            <ReferenceDataUploader setReferenceData={setReferenceData} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">第2步：上传用户数据</h2>
            <UserDataUploader setUserData={setUserData} />
          </div>
        </div>
        
        {referenceData && userData && (
          <div className="mb-8">
            <button
              onClick={processMatching}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              执行匹配分析
            </button>
          </div>
        )}
        
        {results && (
          <div>
            <h2 className="text-xl font-semibold mb-4">匹配结果</h2>
            <ResultsDisplay results={results} />
          </div>
        )}
      </main>
    </div>
  );
} 