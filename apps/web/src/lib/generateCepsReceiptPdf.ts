import jsPDF from 'jspdf'
import QRCode from 'qrcode'

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

export async function generateCepsReceiptPdf(data: ComprobanteCepsData): Promise<void> {
  // Dimensiones tipo ticket móvil vertical centrado (ancho: 95mm, alto: 280mm)
  // Formato ideal para visualización directa en pantalla de smartphone sin necesidad de zoom o paneo horizontal.
  const pageWidth = 95
  const pageHeight = 280
  const margin = 8
  const contentWidth = pageWidth - margin * 2 // 79mm
  const centerX = pageWidth / 2

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

  // Textos de Cabecera (Todos centrados)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('CEPS PASO DEL NORTE', centerX, 10, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(212, 175, 55)
  doc.text('SEGURIDAD PRIVADA Y CUSTODIA', centerX, 15, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(203, 213, 225)
  doc.text('Cd. Juárez, Chih. • Recursos Humanos', centerX, 19.5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.text('COMPROBANTE DIGITAL DE ASPIRANTE', centerX, 24.5, { align: 'center' })

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

  // 2. Tarjeta Destacada de Folio Oficial con Código QR
  const folioBoxY = 38
  const folioBoxH = 50
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(212, 175, 55)
  doc.setLineWidth(0.6)
  doc.roundedRect(margin, folioBoxY, contentWidth, folioBoxH, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 116, 139)
  doc.text('FOLIO OFICIAL DE REGISTRO', centerX, folioBoxY + 5.5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13.5)
  doc.setTextColor(10, 22, 43)
  doc.text(data.folio, centerX, folioBoxY + 12, { align: 'center' })

  // Generación e inserción de código QR oficial con el Folio
  try {
    const qrDataUrl = await QRCode.toDataURL(data.folio, {
      margin: 1,
      width: 256,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0A162B',
        light: '#FFFFFF',
      },
    })
    const qrSize = 25
    const qrX = (pageWidth - qrSize) / 2
    const qrY = folioBoxY + 14.5
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
  } catch (err) {
    console.error('Error al generar código QR en ticket:', err)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.8)
  doc.setTextColor(10, 22, 43)
  doc.text('CÓDIGO QR PARA VALORACIÓN Y ACCESO', centerX, folioBoxY + 42.5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(100, 116, 139)
  doc.text(`Emisión: ${data.fechaRegistro}`, centerX, folioBoxY + 46.5, { align: 'center' })

  // Cursor vertical para el flujo de secciones (Todas centradas)
  let curY = folioBoxY + folioBoxH + 6

  // Helper para títulos de sección (centrados con adorno)
  const addSectionTitle = (titulo: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(10, 22, 43)
    doc.text(`— ${titulo.toUpperCase()} —`, centerX, curY + 2.5, { align: 'center' })
    curY += 5.5
  }

  // Helper para campos clave-valor (todos justificados al centro)
  const addField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(100, 116, 139)
    doc.text(label.toUpperCase(), centerX, curY, { align: 'center' })
    curY += 2.8

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(15, 23, 42)
    const lineas = doc.splitTextToSize(value || 'N/A', contentWidth - 4)
    lineas.forEach((line: string) => {
      doc.text(line, centerX, curY, { align: 'center' })
      curY += 3.4
    })
    curY += 1.8
  }

  // Helper para separador centrado
  const addDivider = () => {
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(margin + 10, curY, pageWidth - margin - 10, curY)
    curY += 4
  }

  // SECCIÓN 1: DATOS DEL ASPIRANTE (CENTRADO)
  addSectionTitle('1. Datos del Aspirante')
  addField('Nombre Completo', data.nombre)
  addField('Teléfono Celular (WhatsApp)', data.telefono)
  addField('CURP', data.curp || 'N/A')
  addField('RFC con Homoclave', data.rfc || 'N/A')

  addDivider()

  // SECCIÓN 2: POSTULACIÓN Y ASIGNACIÓN (CENTRADO)
  addSectionTitle('2. Postulación y Asignación')
  addField('Puesto Solicitado', data.puesto)
  addField('Módulo de Abordaje', data.modulo)

  addDivider()

  // SECCIÓN 3: UBICACIÓN DOMICILIARIA (CENTRADO)
  addSectionTitle('3. Ubicación Domiciliaria')
  const direccionCompleta = data.colonia
    ? `${data.domicilio}, Col. ${data.colonia}`
    : data.domicilio
  addField('Dirección Registrada', direccionCompleta)
  addField('Coordenadas GPS (Croquis)', data.coordenadas)

  addDivider()

  // SECCIÓN 4: DOCUMENTOS DIGITALIZADOS (CENTRADO)
  addSectionTitle('4. Documentos Digitalizados')
  const docs =
    data.documentosAdjuntos && data.documentosAdjuntos.length > 0
      ? data.documentosAdjuntos
      : ['Fotografías y datos capturados en módulo']

  docs.forEach((docName) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(5, 150, 105)
    doc.text(`✓ ${docName}`, centerX, curY, { align: 'center' })
    curY += 4
  })

  curY += 1
  addDivider()

  // SECCIÓN 5: INDICACIONES DE CITA (CAJA CENTRADA)
  const boxH = 32
  doc.setFillColor(254, 243, 199) // Amber 100
  doc.setDrawColor(245, 158, 11)  // Amber 500
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, curY, contentWidth, boxH, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(180, 83, 9)
  doc.text('INDICACIONES DE EVALUACIÓN Y CITA', centerX, curY + 4.5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(69, 26, 3)

  const instrucciones = [
    '1. Reclutamiento te contactará vía telefónica o WhatsApp.',
    '2. Te asignarán fecha, horario y ubicación para valoración y antidoping.',
    '3. Presenta original y copia de INE y Comprobante de Domicilio.',
    '4. Muestra este código QR en tu celular para acceder a tu valoración.',
  ]

  let instY = curY + 8.5
  instrucciones.forEach((inst) => {
    doc.text(inst, centerX, instY, { align: 'center' })
    instY += 4.5
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

  // PIE DE PÁGINA CENTRADO
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.2)
  doc.setTextColor(148, 163, 184)
  doc.text('Comprobante digital emitido por la Plataforma Oficial de CEPS Paso del Norte.', centerX, curY, { align: 'center' })
  doc.text('Presenta este comprobante desde tu celular en tu evaluación.', centerX, curY + 3.2, { align: 'center' })

  // Guardar y descargar automáticamente
  doc.save(`Ticket_CEPS_${data.folio}.pdf`)
}
