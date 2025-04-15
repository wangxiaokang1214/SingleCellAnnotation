import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ReferenceDataUploader({ setReferenceData }) {
  const [file, setFile] = useState(null);
  const [manualData, setManualData] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 处理Excel文件上传
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setError('');
    setSuccess(false);
  };

  // 处理手动输入文本变化
  const handleManualDataChange = (e) => {
    setManualData(e.target.value);
    setError('');
    setSuccess(false);
  };

  // 处理Excel文件解析
  const parseExcelFile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      processReferenceData(jsonData);
    } catch (err) {
      setError('解析Excel文件失败，请确保文件格式正确');
      setLoading(false);
    }
  };

  // 处理手动输入的文本数据
  const parseManualData = () => {
    setLoading(true);
    setError('');
    
    try {
      // 分割文本为行
      const rows = manualData.trim().split('\n');
      
      // 第一行应该是标题
      const headers = rows[0].split('\t');
      
      // 验证标题
      const subclassLabelIndex = headers.indexOf('subclass_label');
      const markersIndex = headers.indexOf('subclass.markers.combo');
      
      if (subclassLabelIndex === -1 || markersIndex === -1) {
        throw new Error('缺少必要的列：subclass_label 或 subclass.markers.combo');
      }
      
      // 解析数据行
      const jsonData = [];
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split('\t');
        if (values.length >= Math.max(subclassLabelIndex, markersIndex) + 1) {
          jsonData.push({
            'subclass_label': values[subclassLabelIndex],
            'subclass.markers.combo': values[markersIndex]
          });
        }
      }
      
      processReferenceData(jsonData);
    } catch (err) {
      setError('解析手动输入数据失败: ' + err.message);
      setLoading(false);
    }
  };

  // 处理参考数据，格式化为应用程序所需的格式
  const processReferenceData = (jsonData) => {
    try {
      // 检查必要的列是否存在
      if (!jsonData.length || !jsonData[0].hasOwnProperty('subclass_label') || !jsonData[0].hasOwnProperty('subclass.markers.combo')) {
        throw new Error('数据缺少必要的列：subclass_label 或 subclass.markers.combo');
      }
      
      // 转换为所需的格式 {subclass_label: [gene1, gene2, ...]}
      const formattedData = {};
      
      jsonData.forEach(row => {
        const subclassLabel = row['subclass_label'];
        const genesStr = row['subclass.markers.combo'];
        
        // 分割基因字符串为数组（以逗号分隔）
        const genes = genesStr.split(',').map(gene => gene.trim()).filter(gene => gene);
        
        formattedData[subclassLabel] = genes;
      });
      
      // 检查是否有有效数据
      if (Object.keys(formattedData).length === 0) {
        throw new Error('未找到有效的数据');
      }
      
      // 设置数据并更新状态
      setReferenceData(formattedData);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError('处理数据失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 提交处理
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (uploadMethod === 'file' && !file) {
      setError('请选择一个Excel文件');
      return;
    }
    
    if (uploadMethod === 'manual' && !manualData.trim()) {
      setError('请输入数据');
      return;
    }
    
    if (uploadMethod === 'file') {
      parseExcelFile();
    } else {
      parseManualData();
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow">
      <div className="mb-4">
        <div className="flex space-x-4">
          <button
            type="button"
            className={`px-3 py-1 rounded ${uploadMethod === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setUploadMethod('file')}
          >
            上传Excel文件
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded ${uploadMethod === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setUploadMethod('manual')}
          >
            手动输入
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {uploadMethod === 'file' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择Excel文件（包含subclass_label和subclass.markers.combo列）
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="block w-full text-sm border border-gray-300 rounded-md p-2"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入制表符分隔的数据（包含subclass_label和subclass.markers.combo列的表头行）
            </label>
            <textarea
              value={manualData}
              onChange={handleManualDataChange}
              className="w-full h-40 p-2 border border-gray-300 rounded-md text-sm font-mono"
              placeholder="subclass_label\tsubclass.markers.combo\n类别1\t基因1,基因2,基因3\n类别2\t基因4,基因5,基因6"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md ${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-medium`}
        >
          {loading ? '处理中...' : '上传并处理参考数据'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
          参考数据上传成功！
        </div>
      )}
    </div>
  );
} 