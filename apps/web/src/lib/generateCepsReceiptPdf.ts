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
  // Dimensiones tipo ticket móvil (ancho: 95mm, alto: 245mm)
  // Formato ideal para visualización directa en pantalla de smartphone sin necesidad de zoom o paneo horizontal.
  const pageWidth = 95
  const pageHeight = 245
  const margin = 8
  const contentWidth = pageWidth - margin * 2 // 79mm

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageWidth, pageHeight],
  })

  // 1. Cabecera Institucional Navy (#0A162B)
  doc.setFillColor(10, 22, 43)
  doc.rect(0, 0, pageWidth, 28, 'F')

  // Línea dorada de acento (#D4AF37)
  doc.setFillColor(212, 175, 55)
  doc.rect(0, 28, pageWidth, 2, 'F')

  // Textos de Cabecera
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('CEPS PASO DEL NORTE', pageWidth / 2, 10, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(212, 175, 55)
  doc.text('SEGURIDAD PRIVADA Y CUSTODIA', pageWidth / 2, 15, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(203, 213, 225)
  doc.text('Cd. Juárez, Chih. • Recursos Humanos', pageWidth / 2, 19.5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.text('COMPROBANTE DIGITAL DE ASPIRANTE', pageWidth / 2, 24.5, { align: 'center' })

  // Muescas laterales de ticket (estilo pase digital)
  const notchY = 34
  doc.setFillColor(255, 255, 255)
  doc.circle(0, notchY, 3.5, 'F')
  doc.circle(pageWidth, notchY, 3.5, 'F')

  // Línea punteada de corte
  doc.setDrawColor(203, 213, 225)
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.setLineWidth(0.3)
  doc.line(6, notchY, pageWidth - 6, notchY)
  doc.setLineDashPattern([], 0)

  // 2. Tarjeta Destacada de Folio Oficial
  const folioBoxY = 38
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(212, 175, 55)
  doc.setLineWidth(0.6)
  doc.roundedRect(margin, folioBoxY, contentWidth, 25, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 116, 139)
  doc.text('FOLIO OFICIAL DE REGISTRO', pageWidth / 2, folioBoxY + 5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(10, 22, 43)
  doc.text(data.folio, pageWidth / 2, folioBoxY + 12, { align: 'center' })

  // Código de barras simulado (vectorial estilizado)
  const barY = folioBoxY + 14.5
  const barHeight = 4.5
  const barCode = (data.folio || 'CEPS-2026-0000').toUpperCase()
  let curBarX = (pageWidth - 44) / 2
  for (let i = 0; i < barCode.length; i++) {
    const code = barCode.charCodeAt(i)
    const isThick = code % 2 === 0
    const barW = isThick ? 0.9 : 0.45
    doc.setFillColor(10, 22, 43)
    doc.rect(curBarX, barY, barW, barHeight, 'F')
    curBarX += barW + ((code % 3 === 0) ? 0.7 : 0.4)
    if (curBarX > pageWidth / 2 + 20) break
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(100, 116, 139)
  doc.text(`Emisión: ${data.fechaRegistro}`, pageWidth / 2, folioBoxY + 23, { align: 'center' })

  // Cursor vertical para flujo continuo y sin solapamientos
  let curY = 67

  // Helper para títulos de sección
  const addSectionTitle = (titulo: string) => {
    doc.setFillColor(212, 175, 55)
    doc.rect(margin, curY, 2, 3.8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(10, 22, 43)
    doc.text(titulo.toUpperCase(), margin + 3.5, curY + 3)
    curY += 5.8
  }

  // Helper para pares clave-valor verticales
  const addField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(100, 116, 139)
    doc.text(label.toUpperCase(), margin, curY)
    curY += 2.8

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(15, 23, 42)
    const lineas = doc.splitTextToSize(value || 'N/A', contentWidth)
    doc.text(lineas, margin, curY)
    curY += lineas.length * 3.4 + 2
  }

  // Separador de sección
  const addDivider = () => {
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(margin, curY, pageWidth - margin, curY)
    curY += 3.8
  }

  // SECCIÓN 1: DATOS DEL ASPIRANTE
  addSectionTitle('1. Datos del Aspirante')
  addField('Nombre Completo', data.nombre)
  addField('Teléfono Celular (WhatsApp)', data.telefono)
  addField('CURP', data.curp || 'N/A')
  addField('RFC con Homoclave', data.rfc || 'N/A')

  addDivider()

  // SECCIÓN 2: POSTULACIÓN Y MÓDULO
  addSectionTitle('2. Postulación y Asignación')
  addField('Puesto Solicitado', data.puesto)
  addField('Módulo de Abordaje', data.modulo)

  addDivider()

  // SECCIÓN 3: UBICACIÓN DOMICILIARIA
  addSectionTitle('3. Ubicación Domiciliaria')
  const direccionCompleta = data.colonia
    ? `${data.domicilio}, Col. ${data.colonia}`
    : data.domicilio
  addField('Dirección Registrada', direccionCompleta)
  addField('Coordenadas GPS (Croquis)', data.coordenadas)

  addDivider()

  // SECCIÓN 4: DOCUMENTOS DIGITALIZADOS
  addSectionTitle('4. Documentos Digitalizados')
  const docs = data.documentosAdjuntos && data.documentosAdjuntos.length > 0
    ? data.documentosAdjuntos
    : ['Fotografías y datos capturados en módulo']

  docs.forEach((docName) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(5, 150, 105) // Emerald 600
    doc.text('[✓ REGISTRADO]', margin, curY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    const lineasDoc = doc.splitTextToSize(docName, contentWidth - 22)
    doc.text(lineasDoc, margin + 20, curY)
    curY += Math.max(lineasDoc.length * 3.2, 4)
  })

  curY += 1.5
  addDivider()

  // SECCIÓN 5: INDICACIONES DE EVALUACIÓN MÉDICA (CAJA RESALTADA)
  const boxH = 32
  doc.setFillColor(254, 243, 199) // Amber 100
  doc.setDrawColor(245, 158, 11)  // Amber 500
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, curY, contentWidth, boxH, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(180, 83, 9)
  doc.text('INDICACIONES DE EVALUACIÓN Y CITA', margin + 3, curY + 4.2)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(69, 26, 3)

  const instrucciones = [
    '1. Reclutamiento te contactará vía telefónica o WhatsApp.',
    '2. Te asignarán fecha, horario y ubicación para valoración y antidoping.',
    '3. Presenta original y copia de INE y Comprobante de Domicilio.',
    '4. Conserva este comprobante oficial en tu celular con tu Folio.',
  ]

  let instY = curY + 8.2
  instrucciones.forEach((inst) => {
    const lines = doc.splitTextToSize(inst, contentWidth - 6)
    doc.text(lines, margin + 3, instY)
    instY += lines.length * 2.8 + 1.8
  })

  curY += boxH + 3.5

  // Muescas inferiores de ticket
  doc.setFillColor(255, 255, 255)
  doc.circle(0, curY, 3, 'F')
  doc.circle(pageWidth, curY, 3, 'F')

  doc.setDrawColor(203, 213, 225)
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.setLineWidth(0.3)
  doc.line(6, curY, pageWidth - 6, curY)
  doc.setLineDashPattern([], 0)

  curY += 4.5

  // PIE DE PÁGINA
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.2)
  doc.setTextColor(148, 163, 184)
  doc.text('Comprobante digital emitido por la Plataforma Oficial de CEPS Paso del Norte.', pageWidth / 2, curY, { align: 'center' })
  doc.text('Presenta este comprobante desde tu celular en tu evaluación.', pageWidth / 2, curY + 3.2, { align: 'center' })

  // Guardar y descargar automáticamente
  doc.save(`Ticket_CEPS_${data.folio}.pdf`)
}
