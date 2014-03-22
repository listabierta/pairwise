class AddLinksToCandidates < ActiveRecord::Migration
  def self.up
    add_column "candidates", "link_linkedin", :string, :default => ""
    add_column "candidates", "link_twitter", :string, :default => ""
    add_column "candidates", "link_facebook", :string, :default => ""
    add_column "candidates", "link_youtube", :string, :default => ""
    add_column "candidates", "link_blog", :string, :default => ""
    add_column "candidates", "link_klout", :string, :default => ""
  end

  def self.down
  end
end
