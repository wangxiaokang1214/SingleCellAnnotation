import { useState, Fragment } from 'react';

export default function ResultsDisplay({ results }) {
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [expandedSubclass, setExpandedSubclass] = useState(null);

  // 切换集群详情展开状态
  const toggleClusterExpand = (cluster) => {
    if (expandedCluster === cluster) {
      setExpandedCluster(null);
    } else {
      setExpandedCluster(cluster);
      setExpandedSubclass(null);
    }
  };

  // 切换子类详情展开状态
  const toggleSubclassExpand = (subclass) => {
    if (expandedSubclass === subclass) {
      setExpandedSubclass(null);
    } else {
      setExpandedSubclass(subclass);
    }
  };

  // 如果没有结果，显示提示信息
  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
        暂无匹配结果。请先上传参考数据和用户数据，然后执行匹配分析。
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              聚类 (Cluster)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              最佳匹配子类 (Subclass)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              匹配分数
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.keys(results).map((cluster) => (
            <Fragment key={cluster}>
              <tr className={expandedCluster === cluster ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cluster}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {results[cluster].bestMatch || '无匹配'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {results[cluster].highestScore ? (results[cluster].highestScore * 100).toFixed(2) + '%' : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => toggleClusterExpand(cluster)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {expandedCluster === cluster ? '收起详情' : '查看详情'}
                  </button>
                </td>
              </tr>
              
              {/* 展开的详细信息 */}
              {expandedCluster === cluster && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 bg-gray-50">
                    <div className="text-sm">
                      <h4 className="font-semibold mb-2">聚类 {cluster} 的详细匹配结果：</h4>
                      
                      {/* 子类匹配列表 */}
                      <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">子类标签</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">匹配分数</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">匹配基因数</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {Object.keys(results[cluster].details).map((subclass) => {
                              const detail = results[cluster].details[subclass];
                              return (
                                <Fragment key={subclass}>
                                  <tr className={expandedSubclass === subclass ? 'bg-blue-50' : ''}>
                                    <td className="px-4 py-2 text-sm">
                                      {subclass}
                                      {results[cluster].bestMatch === subclass && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          最佳匹配
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {(detail.score * 100).toFixed(2)}%
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {detail.matchedCount}/{detail.totalReferenceGenes}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      <button
                                        onClick={() => toggleSubclassExpand(subclass)}
                                        className="text-blue-600 hover:text-blue-900"
                                      >
                                        {expandedSubclass === subclass ? '收起' : '匹配基因'}
                                      </button>
                                    </td>
                                  </tr>
                                  
                                  {/* 展开的匹配基因列表 */}
                                  {expandedSubclass === subclass && (
                                    <tr>
                                      <td colSpan="4" className="px-4 py-2 bg-gray-50">
                                        <div className="text-sm">
                                          <h5 className="font-medium mb-1">匹配的基因：</h5>
                                          <div className="flex flex-wrap gap-1 mb-2">
                                            {detail.matchedGenes.length > 0 ? (
                                              detail.matchedGenes.map((gene) => (
                                                <span key={gene} className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                                  {gene}
                                                </span>
                                              ))
                                            ) : (
                                              <span className="text-gray-500">无匹配基因</span>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-2">结果说明：</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>每个聚类（cluster）都与最匹配的子类（subclass_label）关联</li>
          <li>匹配分数表示聚类中基因与子类标记基因的匹配程度</li>
          <li>点击"查看详情"可以看到每个子类的具体匹配情况</li>
          <li>点击"匹配基因"可以查看具体匹配到的基因列表</li>
        </ul>
      </div>
    </div>
  );
} 