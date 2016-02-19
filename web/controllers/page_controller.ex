defmodule Slaughterhouse.PageController do
  use Slaughterhouse.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
