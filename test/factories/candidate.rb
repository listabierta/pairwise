Factory.define :candidate do |candidate|
  candidate.original_file_name { 'string' }
  candidate.rotation { 1 }
  candidate.nombre { 'string' }
  candidate.apellidos { 'string' }
  candidate.estudios { 'string' }
  candidate.profesion { 'string' }
  candidate.idiomas { 'string' }
  candidate.partido_politico { 'string' }
  candidate.url_mifirma { 'string' }
  candidate.contribucion_social { 'text' }
  candidate.motivaciones { 'text' }
end
