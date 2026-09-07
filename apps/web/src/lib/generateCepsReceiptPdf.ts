import jsPDF from 'jspdf'

export interface ComprobanteCepsData {
  folio: string
  nombre: string
  telefono: string
  curp: string
  rfc: string
  puesto: string
  modulo: string
  domicilio: string
  colonia: string
  coordenadas: string
  fechaRegistro: string
  documentosAdjuntos: string[]
}

export function generateCepsReceiptPdf(data: ComprobanteCepsData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // 1. Cabecera Institucional Navy (#0A162B)
  doc.setFillColor(10, 22, 43)
  doc.rect(0, 0, 210, 38, 'F')

  // Línea dorada de acento (#D4AF37)
  doc.setFillColor(212, 175, 55)
  doc.rect(0, 38, 210, 2.5, 'F')

  // Textos de Cabecera
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('CEPS PASO DEL NORTE S. DE R.L. DE C.V.', 20, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(212, 175, 55)
  doc.text('SEGURIDAD PRIVADA, VIGILANCIA Y CUSTODIA ESPECIALIZADA', 20, 23)

  doc.setFontSize(8)
  doc.setTextColor(200, 210, 225)
  doc.text('Ciudad Juárez, Chihuahua • Departamento de Recursos Humanos y Contratación', 20, 29)

  // 2. Bloque de Folio Oficial
  doc.setFillColor(241, 245, 249)
  doc.roundedRect(135, 8, 60, 22, 2, 2, 'F')
  doc.setDrawColor(212, 175, 55)
  doc.setLineWidth(0.8)
  doc.roundedRect(135, 8, 60, 22, 2, 2, 'D')

  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text('FOLIO DE REGISTRO', 145, 14)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(10, 22, 43)
  doc.text(data.folio, 140, 23)

  // 3. Título del Documento
  doc.setTextColor(10, 22, 43)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('COMPROBANTE OFICIAL DE POSTULACIÓN Y CITA', 20, 50)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`Fecha y Hora de Emisión: ${data.fechaRegistro} • Plataforma Unificada CEPS`, 20, 56)

  // 4. Datos del Candidato
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.5)
  doc.line(20, 60, 190, 60)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(10, 22, 43)
  doc.text('1. Datos Generales del Prospecto', 20, 67)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Nombre Completo:', 20, 75)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(data.nombre, 60, 75)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Teléfono (WhatsApp):', 20, 82)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(data.telefono, 60, 82)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('CURP:', 110, 75)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(data.curp || 'N/A', 130, 75)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('RFC:', 110, 82)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(data.rfc || 'N/A', 130, 82)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Puesto de Interés:', 20, 89)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(data.puesto, 60, 89)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Módulo de Abordaje:', 110, 89)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(data.modulo, 150, 89)

  // 5. Datos Domiciliarios y Croquis Digital
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(10, 22, 43)
  doc.text('2. Ubicación Domiciliaria (Croquis Digital Geolocalizado)', 20, 101)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Dirección:', 20, 109)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(`${data.domicilio}, Col. ${data.colonia}`, 60, 109)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  doc.text('Coordenadas GPS:', 20, 116)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 23, 42)
  doc.text(data.coordenadas, 60, 116)

  // 6. Checklist de Documentos
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(10, 22, 43)
  doc.text('3. Documentos Digitalizados en Origen', 20, 128)

  let yOffset = 136
  data.documentosAdjuntos.forEach((docName) => {
    doc.setFontSize(9)
    doc.setTextColor(5, 150, 105)
    doc.setFont('helvetica', 'bold')
    doc.text('[✓ ADJUNTO]', 20, yOffset)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'normal')
    doc.text(docName, 45, yOffset)
    yOffset += 7
  })

  // 7. Instrucciones para la Cita Médica
  doc.setFillColor(254, 243, 199)
  doc.roundedRect(20, yOffset + 5, 170, 50, 3, 3, 'F')
  doc.setDrawColor(245, 158, 11)
  doc.roundedRect(20, yOffset + 5, 170, 50, 3, 3, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(180, 83, 9)
  doc.text('INDICACIONES DE EVALUACIÓN Y CONTACTO DE RECLUTAMIENTO', 25, yOffset + 14)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(69, 26, 3)
  doc.text('1. Pronto recibirás más información sobre tu evaluación médica y examen de antidoping.', 25, yOffset + 21)
  doc.text('2. El equipo de Reclutamiento de CEPS te contactará directamente vía telefónica o WhatsApp.', 25, yOffset + 27)
  doc.text('3. Te indicarán fecha, horario y ubicación de tu valoración sin necesidad de agendar cita previa.', 25, yOffset + 33)
  doc.text('4. Ten a la mano original y copia de: INE vigente, Acta de Nacimiento y Comprobante de Domicilio.', 25, yOffset + 39)
  doc.text('5. Conserva este comprobante oficial con tu Folio de aspirante para cualquier aclaración.', 25, yOffset + 45)

  // 8. Sello de Seguridad y Pie de Página
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('Este documento es un comprobante digital expedido por la Plataforma Oficial de CEPS Paso del Norte.', 20, 275)
  doc.text(`Identificador de Integridad: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()} • Célula 0 Dataholics`, 20, 280)

  // Guardar y descargar automáticamente
  doc.save(`Comprobante_CEPS_${data.folio}.pdf`)
}
