import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Car, FileText, Users, AlertCircle, Filter } from 'lucide-react';
import { User } from '../types';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface ReportsProps {
  user: User;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'day' | 'month' | 'year'>('day');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const isAdmin = user.permissions.includes('admin') || user.permissions.includes('reports');

  // Obtener datos desde localStorage para reflejar cambios en tiempo real
  const getReportData = () => {
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const touristVehicles = JSON.parse(localStorage.getItem('tourist_vehicles') || '[]');
    const allVehicles = [...vehicles, ...touristVehicles];
    
    const declarations = JSON.parse(localStorage.getItem('declarations') || '[]');
    
    const minors = JSON.parse(localStorage.getItem('minors') || '[]');
    const touristMinors = JSON.parse(localStorage.getItem('tourist_minors') || '[]');
    const allMinors = [...minors, ...touristMinors];

    return {
      vehicles: {
        total: allVehicles.length,
        approved: allVehicles.filter((v: any) => v.status === 'approved').length,
        rejected: allVehicles.filter((v: any) => v.status === 'rejected').length,
        pending: allVehicles.filter((v: any) => v.status === 'pending').length
      },
      declarations: {
        total: declarations.length,
        approved: declarations.filter((d: any) => d.status === 'approved').length,
        rejected: declarations.filter((d: any) => d.status === 'rejected').length,
        pending: declarations.filter((d: any) => d.status === 'pending').length
      },
      minors: {
        total: allMinors.length,
        complete: allMinors.filter((m: any) => m.status === 'complete').length,
        incomplete: allMinors.filter((m: any) => m.status === 'incomplete').length
      },
      issues: [
        { type: 'Documentos incompletos', count: allMinors.filter((m: any) => m.status === 'incomplete').length, category: 'menores' },
        { type: 'Declaraciones pendientes', count: declarations.filter((d: any) => d.status === 'pending').length, category: 'declaraciones' },
        { type: 'Vehículos pendientes', count: allVehicles.filter((v: any) => v.status === 'pending').length, category: 'vehículos' }
      ]
    };
  };

  const reportData = getReportData();

  const generateExcelReport = async () => {
    setIsGenerating(true);
    try {
      // Crear un nuevo libro de trabajo
      const workbook = XLSX.utils.book_new();

      // Datos del reporte
      let dateText = '';
      if (reportType === 'day') {
        dateText = new Date(selectedDate).toLocaleDateString('es-CL');
      } else if (reportType === 'month') {
        dateText = new Date(selectedDate).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
      } else {
        dateText = new Date(selectedDate).getFullYear().toString();
      }

      // Hoja 1: Resumen General
      const summaryData = [
        ['REPORTE CONTROL FRONTERIZO - PASO SAMORÉ'],
        [''],
        ['Período:', dateText],
        ['Usuario:', `${user.name} (${user.id})`],
        ['Fecha de generación:', `${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL')}`],
        [''],
        ['RESUMEN GENERAL'],
        ['Categoría', 'Total', 'Aprobados', 'Rechazados', 'Pendientes'],
        ['Vehículos', reportData.vehicles.total, reportData.vehicles.approved, reportData.vehicles.rejected, reportData.vehicles.pending],
        ['Declaraciones', reportData.declarations.total, reportData.declarations.approved, reportData.declarations.rejected, reportData.declarations.pending],
        ['Menores', reportData.minors.total, reportData.minors.complete, '', reportData.minors.incomplete]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // Hoja 2: Vehículos Detallados
      const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
      const touristVehicles = JSON.parse(localStorage.getItem('tourist_vehicles') || '[]');
      const allVehicles = [...vehicles, ...touristVehicles];
      
      const vehicleData = [
        ['DETALLE DE VEHÍCULOS'],
        [''],
        ['Patente', 'Tipo', 'Propietario', 'Estado', 'Fecha', 'Documentos']
      ];
      
      allVehicles.forEach((vehicle: any) => {
        vehicleData.push([
          vehicle.plate,
          vehicle.type,
          vehicle.owner,
          vehicle.status === 'approved' ? 'Aprobado' : vehicle.status === 'rejected' ? 'Rechazado' : 'Pendiente',
          new Date(vehicle.date).toLocaleDateString('es-CL'),
          Array.isArray(vehicle.documents) ? vehicle.documents.join(', ') : 
          (vehicle.documents && typeof vehicle.documents === 'object' ? 
            Object.values(vehicle.documents).filter(Boolean).join(', ') : 'Sin documentos')
        ]);
      });

      const vehicleSheet = XLSX.utils.aoa_to_sheet(vehicleData);
      XLSX.utils.book_append_sheet(workbook, vehicleSheet, 'Vehículos');

      // Hoja 3: Declaraciones Detalladas
      const declarations = JSON.parse(localStorage.getItem('declarations') || '[]');
      const declarationData = [
        ['DETALLE DE DECLARACIONES'],
        [''],
        ['Tipo', 'Viajero', 'Productos', 'Estado', 'Fecha', 'Notas']
      ];
      
      declarations.forEach((declaration: any) => {
        declarationData.push([
          declaration.type === 'food' ? 'Alimentos' : 'Mascotas',
          declaration.traveler,
          declaration.items.join(', '),
          declaration.status === 'approved' ? 'Aprobado' : declaration.status === 'rejected' ? 'Rechazado' : 'Pendiente',
          new Date(declaration.date).toLocaleDateString('es-CL'),
          declaration.notes || 'Sin notas'
        ]);
      });

      const declarationSheet = XLSX.utils.aoa_to_sheet(declarationData);
      XLSX.utils.book_append_sheet(workbook, declarationSheet, 'Declaraciones');

      // Hoja 4: Menores Detallados
      const minors = JSON.parse(localStorage.getItem('minors') || '[]');
      const touristMinors = JSON.parse(localStorage.getItem('tourist_minors') || '[]');
      const allMinors = [...minors, ...touristMinors];
      
      const minorData = [
        ['DETALLE DE MENORES'],
        [''],
        ['Nombre', 'Edad', 'Tutor', 'Estado', 'Fecha', 'Documentos']
      ];
      
      allMinors.forEach((minor: any) => {
        minorData.push([
          minor.name || minor.fullName,
          minor.age,
          minor.guardian,
          minor.status === 'complete' ? 'Completo' : 'Incompleto',
          new Date(minor.date).toLocaleDateString('es-CL'),
          Array.isArray(minor.documents) ? minor.documents.join(', ') : 
          (minor.documents && typeof minor.documents === 'object' ? 
            Object.values(minor.documents).filter(Boolean).join(', ') : 'Sin documentos')
        ]);
      });

      const minorSheet = XLSX.utils.aoa_to_sheet(minorData);
      XLSX.utils.book_append_sheet(workbook, minorSheet, 'Menores');

      // Hoja 5: Problemas Frecuentes (solo para admin)
      if (isAdmin) {
        const issuesData = [
          ['PROBLEMAS FRECUENTES'],
          [''],
          ['Tipo de Problema', 'Cantidad', 'Categoría']
        ];
        
        reportData.issues.forEach(issue => {
          if (issue.count > 0) {
            issuesData.push([issue.type, issue.count, issue.category]);
          }
        });

        const issuesSheet = XLSX.utils.aoa_to_sheet(issuesData);
        XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Problemas');
      }

      // Generar y descargar el archivo
      const fileName = `reporte-${reportType}-${selectedDate.replace(/-/g, '')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error al generar el archivo Excel. Por favor intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFReport = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORTE CONTROL FRONTERIZO', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.text('Paso Samoré', pageWidth / 2, 30, { align: 'center' });
      
      // Date range
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      let dateText = '';
      if (reportType === 'day') {
        dateText = `Fecha: ${new Date(selectedDate).toLocaleDateString('es-CL')}`;
      } else if (reportType === 'month') {
        dateText = `Mes: ${new Date(selectedDate).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`;
      } else {
        dateText = `Año: ${new Date(selectedDate).getFullYear()}`;
      }
      pdf.text(dateText, pageWidth / 2, 40, { align: 'center' });
      
      // User info
      pdf.text(`Generado por: ${user.name} (${user.id})`, 20, 50);
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL')}`, 20, 58);
      
      // Line separator
      pdf.line(20, 65, pageWidth - 20, 65);
      
      let yPosition = 75;
      
      // Vehicles section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🚗 VEHÍCULOS', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total procesados: ${reportData.vehicles.total}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`✅ Aprobados: ${reportData.vehicles.approved}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`❌ Rechazados: ${reportData.vehicles.rejected}`, 25, yPosition);
      yPosition += 6;
      if (isAdmin) {
        pdf.text(`⏳ Pendientes: ${reportData.vehicles.pending}`, 25, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
      
      // Declarations section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📋 DECLARACIONES', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total procesadas: ${reportData.declarations.total}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`✅ Aprobadas: ${reportData.declarations.approved}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`❌ Rechazadas: ${reportData.declarations.rejected}`, 25, yPosition);
      yPosition += 6;
      if (isAdmin) {
        pdf.text(`⏳ Pendientes: ${reportData.declarations.pending}`, 25, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
      
      // Minors section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('👥 MENORES', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total registrados: ${reportData.minors.total}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`✅ Documentos completos: ${reportData.minors.complete}`, 25, yPosition);
      yPosition += 6;
      if (isAdmin) {
        pdf.text(`⚠️ Documentos incompletos: ${reportData.minors.incomplete}`, 25, yPosition);
        yPosition += 6;
      }
      yPosition += 10;
      
      // Issues section (only for admin)
      if (isAdmin) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🚨 PROBLEMAS FRECUENTES', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        reportData.issues.forEach(issue => {
          if (issue.count > 0) {
            pdf.text(`• ${issue.type}: ${issue.count} casos`, 25, yPosition);
            yPosition += 6;
          }
        });
      }
      
      // Footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Sistema Control Fronterizo v1.0 - Generado automáticamente', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save PDF
      const fileName = `reporte-${reportType}-${selectedDate.replace(/-/g, '')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
          {isAdmin ? 'Informes Estadísticos' : 'Resumen de Actividad'}
        </h2>
      </div>

      {/* Report Generation Controls (Admin only) */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Download className="w-5 h-5 text-blue-600 mr-2" />
            Generación de Reportes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'day' | 'month' | 'year')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="day">Día específico</option>
                <option value="month">Mes específico</option>
                <option value="year">Año específico</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {reportType === 'day' ? 'Fecha' : reportType === 'month' ? 'Mes' : 'Año'}
              </label>
              <input
                type={reportType === 'year' ? 'number' : reportType === 'month' ? 'month' : 'date'}
                value={reportType === 'year' ? new Date(selectedDate).getFullYear() : selectedDate}
                onChange={(e) => {
                  if (reportType === 'year') {
                    setSelectedDate(`${e.target.value}-01-01`);
                  } else {
                    setSelectedDate(e.target.value);
                  }
                }}
                min={reportType === 'year' ? '2020' : undefined}
                max={reportType === 'year' ? new Date().getFullYear() : undefined}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={generatePDFReport}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Generando...' : 'PDF'}</span>
              </button>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={generateExcelReport}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Generando...' : 'Excel'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vehículos Procesados</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.vehicles.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Car className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">
              {reportData.vehicles.approved} aprobados, {reportData.vehicles.rejected} rechazados
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Declaraciones</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.declarations.total}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">
              {reportData.declarations.approved} aprobadas, {reportData.declarations.rejected} rechazadas
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Menores Registrados</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.minors.total}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {isAdmin && reportData.minors.incomplete > 0 ? (
              <span className="text-yellow-600">{reportData.minors.incomplete} documentos incompletos</span>
            ) : (
              <span className="text-green-600">{reportData.minors.complete} documentos completos</span>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Vehículos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aprobados</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${reportData.vehicles.total > 0 ? (reportData.vehicles.approved / reportData.vehicles.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{reportData.vehicles.approved}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rechazados</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${reportData.vehicles.total > 0 ? (reportData.vehicles.rejected / reportData.vehicles.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{reportData.vehicles.rejected}</span>
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pendientes</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${reportData.vehicles.total > 0 ? (reportData.vehicles.pending / reportData.vehicles.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{reportData.vehicles.pending}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issues Report (Admin only) */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              Problemas Frecuentes
            </h3>
            <div className="space-y-3">
              {reportData.issues.filter(issue => issue.count > 0).map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{issue.type}</p>
                    <p className="text-xs text-gray-600 capitalize">{issue.category}</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">{issue.count}</span>
                </div>
              ))}
              {reportData.issues.every(issue => issue.count === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p>No hay problemas reportados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;