class AvalController < InheritedResources::Base
  def new
    allowed_ips = ['174.37.245.', '174.36.197.', '173.193.199.', '119.81.44.', '127.0.0']

    if allowed_ips.any? { |val| /^#{val}/ =~ request.remote_ip }
      msisdn = params[:msisdn].gsub(/[^\d]/, '').to_i
      str_f_id = params[:text].gsub(/[^\d]/, '')

      f_id = str_f_id.to_i

      if f_id
        cand = Candidate.find_by_foreign_id(f_id)

        if cand
          aval = Aval.first(:conditions => ["foreign_id = ? and msisdn = ?", f_id, msisdn])

          if aval
            aval.repeticiones += 1
            aval.save
          else
            aval = Aval.new
            aval.foreign_id = f_id
            aval.msisdn = msisdn
            aval.repeticiones = 1
            aval.save
          end
        end
      end

      respond_to do |format|
        format.html { render :json => { :status => 'success'}, :status => 200 }
      end
    else
      respond_to do |format|
        format.html { render :json => { :status => 'unauthorized'}, :status => 401 }
      end
    end
  end
end
