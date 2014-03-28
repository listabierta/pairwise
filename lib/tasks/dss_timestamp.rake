namespace :util do
  desc "Timestamp certification of avails"
  task :avails_certify => :environment do
    dir= File.join(Dir.pwd, 'avails_save')
    filename = File.join(dir, 'avales_auditoria_' + Time.now.strftime("%Y-%m-%d-%H%M%S") + '.csv')
    All_Avails = Aval.all()
    begin
      file = File.open(filename, "w")
      All_Avails.each do |av|
        file.write(av.msisdn + ',' + av.foreign_id.to_s + "\n")
      end
    rescue IOError => e
      #some error occur, dir not writable etc.
    ensure
      file.close unless file == nil
    end

    file = File.open(filename, "r")
    document = file.read
    file.close

    require 'rubygems'
    require 'dss_client'

    @connector = DssClient.new
    result = @connector.stamp_content(document)
    timestamp = result.signature_object

    
    signature = result.signature_object[0].to_s

    begin
      file = File.open(filename+'.ts', "w")
      file.write(signature)
    rescue IOError => e
      #some error occur, dir not writable etc.
    ensure
      file.close unless file == nil
    end

  end
end

