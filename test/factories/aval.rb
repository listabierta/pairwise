Factory.define :aval do |aval|
  aval.foreign_id { 1 }
  aval.msisdn { 'string' }
  aval.repeticiones { 1 }
end
